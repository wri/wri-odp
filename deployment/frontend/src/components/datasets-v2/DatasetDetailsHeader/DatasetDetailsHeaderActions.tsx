import { useState } from 'react';
import {
    Button,
    Dialog,
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
    Tooltip,
} from '@worldresources/wri-design-systems';
import { Pencil1Icon, StarFilledIcon, StarIcon } from '@radix-ui/react-icons';
import { useSession } from 'next-auth/react';
import { api } from '@/utils/api';
import notify from '@/utils/notify';
import type { DatasetDetailsHeaderActionsProps } from './types';

export default function DatasetDetailsHeaderActions({
    dataset,
    extraItems,
}: DatasetDetailsHeaderActionsProps) {
    const session = useSession();
    const userId = session.data?.user?.id;
    const isAuthenticated = session.status === 'authenticated' && !!userId;

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        data: isFavorite,
        isLoading: isFavoriteLoading,
        refetch,
    } = api.dataset.isFavoriteDataset.useQuery(dataset.id, {
        retry: false,
        enabled: isAuthenticated,
    });

    const orgId = dataset.organization?.id ?? dataset.owner_org ?? '';
    const { data: adminUsers } = api.teams.getTeamUsers.useQuery(
        { id: orgId, capacity: 'admin' },
        { enabled: !!orgId && isAuthenticated }
    );
    const { data: editorUsers } = api.teams.getTeamUsers.useQuery(
        { id: orgId, capacity: 'editor' },
        { enabled: !!orgId && isAuthenticated }
    );
    const { data: collaborators } = api.dataset.getDatasetCollaborators.useQuery(
        { id: dataset.name },
        { enabled: !!dataset.name && isAuthenticated, retry: false }
    );

    const teamUsers = (adminUsers ?? []).concat(editorUsers ?? []);
    const isTeamAdminOrEditor =
        teamUsers.length > 0
            ? teamUsers.some((user: string[]) => user[0] === userId)
            : !!collaborators?.some(
                  (collaborator: { id: string; capacity: string }) =>
                      collaborator.id === userId &&
                      (collaborator.capacity === 'admin' || collaborator.capacity === 'editor')
              );
    const canEditDataset =
        isAuthenticated &&
        (!!session.data?.user.sysadmin ||
            dataset.creator_user_id === userId ||
            isTeamAdminOrEditor);

    const addToFavorites = api.dataset.followDataset.useMutation({
        onSuccess: async () => {
            await refetch();
            setIsAddDialogOpen(false);
            notify(
                `Successfully added the ${dataset.title ?? dataset.name} Dataset to your favourites`,
                'success'
            );
        },
        onError: (error) => setErrorMessage(error.message),
    });
    const removeFromFavorites = api.dataset.unFollowDataset.useMutation({
        onSuccess: async () => {
            await refetch();
            setIsRemoveDialogOpen(false);
            notify(
                `Successfully removed the ${dataset.title ?? dataset.name} Dataset from your favourites`,
                'error'
            );
        },
        onError: (error) => setErrorMessage(error.message),
    });

    const closeDialogs = () => {
        setIsAddDialogOpen(false);
        setIsRemoveDialogOpen(false);
        setErrorMessage(null);
    };

    const openFavoritesDialog = () => {
        setErrorMessage(null);
        if (isFavorite) {
            setIsRemoveDialogOpen(true);
            return;
        }
        setIsAddDialogOpen(true);
    };

    const datasetLabel = dataset.title ?? dataset.name;
    const textStyle = {
        color: getThemedColor('neutral', 700),
        fontWeight: 400,
        fontSize: getThemedFontSize(300),
    };

    return (
        <>
            {isAuthenticated && (
                <Tooltip content={isFavorite ? 'Remove from favourites' : 'Add to favourites'}>
                    <Button
                        variant="borderless"
                        size="default"
                        aria-label={isFavorite ? 'remove from favourites' : 'add to favourites'}
                        loading={isFavoriteLoading}
                        onClick={openFavoritesDialog}
                        rightIcon={
                            isFavorite ? (
                                <StarFilledIcon
                                    width={16}
                                    height={16}
                                    color={getThemedColor('primary', 500)}
                                />
                            ) : (
                                <StarIcon
                                    width={16}
                                    height={16}
                                    color={getThemedColor('neutral', 700)}
                                />
                            )
                        }
                    >
                        <div style={textStyle}>
                            {isFavorite ? 'In favourites' : 'Add to favourites'}
                        </div>
                    </Button>
                </Tooltip>
            )}

            {extraItems}

            {canEditDataset && (
                <Tooltip content="Edit dataset">
                    <Button
                        variant="borderless"
                        size="default"
                        aria-label="edit dataset"
                        onClick={() => {
                            window.location.href = `/dashboard/datasets/${dataset.name}/edit`;
                        }}
                        rightIcon={
                            <Pencil1Icon
                                width={16}
                                height={16}
                                color={getThemedColor('secondary', 700)}
                            />
                        }
                    >
                        <div style={textStyle}>Edit</div>
                    </Button>
                </Tooltip>
            )}

            <Dialog
                open={isAddDialogOpen}
                onClose={closeDialogs}
                title="Add to favourites"
                placement="center"
                footer={
                    <div className="flex justify-end" style={{ gap: getThemedSpacing(300) }}>
                        <Button variant="secondary" onClick={closeDialogs}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            loading={addToFavorites.isLoading}
                            onClick={() => addToFavorites.mutate(dataset.id)}
                        >
                            Add
                        </Button>
                    </div>
                }
            >
                <p>Are you sure you want to add {datasetLabel} to your favourites?</p>
                {errorMessage && (
                    <p style={{ color: getThemedColor('error', 500) }}>{errorMessage}</p>
                )}
            </Dialog>

            <Dialog
                open={isRemoveDialogOpen}
                onClose={closeDialogs}
                title="Remove from favourites"
                placement="center"
                footer={
                    <div className="flex justify-end" style={{ gap: getThemedSpacing(300) }}>
                        <Button variant="secondary" onClick={closeDialogs}>
                            Cancel
                        </Button>
                        <Button
                            variant="negative"
                            loading={removeFromFavorites.isLoading}
                            onClick={() => removeFromFavorites.mutate(dataset.id)}
                        >
                            Remove
                        </Button>
                    </div>
                }
            >
                <p>Are you sure you want to remove {datasetLabel} from your favourites?</p>
                {errorMessage && (
                    <p style={{ color: getThemedColor('error', 500) }}>{errorMessage}</p>
                )}
            </Dialog>
        </>
    );
}
