import Login from './Login';
import { Modal } from '@worldresources/wri-design-systems';

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export default function NavigationLoginModal({ isOpen, onClose }: Props) {
    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            size="medium"
            header={<span className="sr-only">Login</span>}
            content={<Login onSignIn={onClose} />}
        >
        </Modal>
    );
}
