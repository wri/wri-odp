import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import SimpleSelect from '@/components/_shared/SimpleSelect';
import { Input } from '@/components/_shared/SimpleInput';
import { useForm } from 'react-hook-form';
import { ErrorDisplay } from '@/components/_shared/InputGroup';
import MulText from '@/components/dashboard/datasets/admin/MulText';
import { type WriDataset } from '@/schema/ckan.schema';
import { countries } from '@/utils/listOfCountries';

type DownloadFormData = {
  email: string;
  firstName: string;
  lastName: string;
  country: { label: string; value: string };
  affiliation: { label: string; value: string };
  otherAffiliation?: string;
  organization?: string;
  jobTitle?: string;
  interests?: { label: string; value: string }[];
  acceptTerms: boolean;
};

export const downloadEventSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  affiliation: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .required(),
  otherAffiliation: z.string().optional(),
  organization: z.string().optional(),
  jobTitle: z.string().optional(),
  country: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .optional(),
  interests: z.array(z.string()).optional(),
});

export type DownloadEventForm = z.infer<typeof downloadEventSchema>;

const affiliationOptions = [
  'Government',
  'Donor Institution/Agency',
  'Local NGO (National or Subnational)',
  'International NGO',
  'UN or International Organization',
  'Academic/Research Organization',
  'Journalist/Media Organization',
  'Indigenous or Community-Based Organization',
  'Private Sector',
  'No Affiliation',
  'Other',
];

const interestOptions = [
  'Restoring Degraded Landscapes',
  'Combating Deforestation',
  'Responsible Supply Chains',
  'Strengthening Indigenous Peoples & Local Communities Land Rights',
  'Improving Agricultural Land Use & Food Systems',
  'Protecting Natural Ecosystems',
];

export function DownloadPopup({
  isOpen,
  onClose,
  onSubmit,
  title,
  downloadButton,
  dataset,
  skipButton,
  subtitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  downloadButton: React.ReactNode;
  dataset: WriDataset;
  skipButton?: React.ReactNode;
  subtitle?: string;
}) {
  const formObj = useForm({
    resolver: zodResolver(
      downloadEventSchema
        .extend({
          acceptTerms: z.boolean(),
        })
        .superRefine((data, ctx) => {
          if (data.affiliation.value === '') {
            ctx.addIssue({
              path: ['affiliation'],
              code: z.ZodIssueCode.custom,
              message: 'Required',
            });
          }
          if (data.affiliation.value === 'Other') {
            if (
              !data.otherAffiliation ||
              data.otherAffiliation == ''
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Required',
                path: ['affiliation'],
              });
            }
          }
          if (data.acceptTerms) {
            if (!data.firstName) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Required',
                path: ['firstName'],
              });
            }
            if (!data.country || data.country.value == '') {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Required',
                path: ['country'],
              });
            }
            if (!data.lastName) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Required',
                path: ['lastName'],
              });
            }
          }
        })
    ),
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = formObj;

  const affiliation = watch('affiliation');

  const required = <span className="text-red-500">*</span>;
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl lg:max-w-2xl sm:p-6">
                <div className="absolute right-4 top-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="absolute right-4 top-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div>
                  <div className="mt-3 sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-semibold leading-6 text-gray-900"
                    >
                      {title}
                    </Dialog.Title>
                    <Dialog.Title
                      as="h4"
                      className="mt-2 font-normal leading-6 text-gray-600"
                    >
                      {subtitle}
                    </Dialog.Title>
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      form-id="email-download"
                      className="mt-6 text-left flex flex-col gap-y-2"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email {required}
                        </label>
                        <Input
                          {...register('email')}
                          placeholder="ex. example@wri.org"
                          type="text"
                        />
                        <ErrorDisplay
                          name="email"
                          errors={errors}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Affiliation {required}
                        </label>
                        <SimpleSelect
                          name="affiliation"
                          formObj={formObj}
                          options={affiliationOptions.map(
                            (o) => ({
                              label: o,
                              value: o,
                            })
                          )}
                          placeholder="Section/Affiliation*"
                          maxWidth="w-full"
                        />
                      </div>

                      {affiliation?.value === 'Other' && (
                        <>
                          <label className="block text-sm font-medium text-gray-700">
                            Please describe your
                            affiliation
                          </label>
                          <Input
                            {...register(
                              'otherAffiliation'
                            )}
                            type="text"
                            placeholder="Describe your affiliation"
                          />
                        </>
                      )}
                      <ErrorDisplay
                        name="affiliation"
                        errors={errors}
                      />

                      <div>
                        <input
                          type="checkbox"
                          {...register(
                            'acceptTerms',
                            {
                              required: true,
                            }
                          )}
                          className="mt-1 h-4 w-4 rounded border-gray-300"
                        />
                        <label className="ml-2 text-sm text-gray-500">
                          Do you want to subscribe to
                          news and updates on the Data
                          Explorer? By checking this
                          box you agree to receive
                          updates from WRI. You can
                          change your email
                          preferences at any time.
                        </label>
                      </div>
                      {watch('acceptTerms') && (
                        <>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                First Name{' '}
                                {watch(
                                  'acceptTerms'
                                ) ? (
                                  required
                                ) : (
                                  <></>
                                )}
                              </label>
                              <Input
                                {...register(
                                  'firstName'
                                )}
                                placeholder="ex. Joe"
                                type="text"
                              />
                              <ErrorDisplay
                                name="firstName"
                                errors={errors}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Last Name{' '}
                                {watch(
                                  'acceptTerms'
                                ) ? (
                                  required
                                ) : (
                                  <></>
                                )}
                              </label>
                              <Input
                                {...register(
                                  'lastName'
                                )}
                                placeholder="ex. Doe"
                                type="text"
                              />
                              <ErrorDisplay
                                name="lastName"
                                errors={errors}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Organization
                                (optional)
                              </label>
                              <Input
                                {...register(
                                  'organization'
                                )}
                                type="text"
                                placeholder="Your organization"
                              />
                              <ErrorDisplay
                                name="organization"
                                errors={errors}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Job Title
                                (optional)
                              </label>
                              <Input
                                {...register(
                                  'jobTitle'
                                )}
                                type="text"
                                placeholder="Your job title"
                              />
                              <ErrorDisplay
                                name="jobTitle"
                                errors={errors}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Country {required}
                            </label>
                            <SimpleSelect
                              name="country"
                              formObj={formObj}
                              options={countries.map(
                                (c) => ({
                                  label: c.name,
                                  value: c.iso,
                                })
                              )}
                              maxWidth="w-full"
                            />
                            <ErrorDisplay
                              name="country"
                              errors={errors}
                            />
                          </div>
                          {[
                            'global-forest-watch',
                            'land-carbon-lab',
                          ].includes(
                            dataset.organization
                              ?.name ?? ''
                          ) && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Interests
                                </label>
                                <MulText
                                  name="interests"
                                  formObj={
                                    formObj
                                  }
                                  options={interestOptions.map(
                                    (o) => ({
                                      label: o,
                                      value: o,
                                    })
                                  )}
                                  title="I'm interested in (optional)"
                                />
                              </div>
                            )}
                        </>
                      )}
                      {downloadButton}
                      <div className="mt-6">
                        {skipButton}
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export function DirectDownloadPopup({
  isOpen,
  onClose,
  onSubmit,
  title,
  downloadButton,
  skipButton,
  subtitle,
  dataset,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  downloadButton: React.ReactNode;
  skipButton: React.ReactNode;
  dataset: WriDataset;
  subtitle?: string;
}) {
  const formObj = useForm<DownloadFormData>({
    resolver: zodResolver(
      downloadEventSchema
        .extend({
          firstName: z.string(),
          lastName: z.string(),
          country: z.object({
            label: z.string(),
            value: z.string(),
          }),
        })
        .superRefine((data, ctx) => {
          if (data.affiliation.value === '') {
            ctx.addIssue({
              path: ['affiliation'],
              code: z.ZodIssueCode.custom,
              message: 'Required',
            });
          }
          if (
            ['global-forest-watch', 'land-carbon-lab'].includes(
              dataset.organization?.name ?? ''
            )
          ) {
            if (!data.interests) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Required',
                path: ['interests'],
              });
            }
          }
          if (data.affiliation.value === 'Other') {
            if (
              !data.otherAffiliation ||
              data.otherAffiliation == ''
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Required',
                path: ['affiliation'],
              });
            }
          }
        })
    ),
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = formObj;

  const affiliation = watch('affiliation');
  const required = <span className="text-red-500">*</span>;
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl lg:max-w-2xl sm:p-6">
                <div>
                  <div className="mt-3 sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-semibold leading-6 text-gray-900"
                    >
                      {title}
                    </Dialog.Title>
                    <Dialog.Title
                      as="h4"
                      className="mt-2 font-normal leading-6 text-gray-600"
                    >
                      {subtitle}
                    </Dialog.Title>
                    <form
                      form-id="direct-download"
                      onSubmit={handleSubmit(onSubmit)}
                      className="mt-6 text-left flex flex-col gap-y-2"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email {required}
                        </label>
                        <Input
                          {...register('email')}
                          placeholder="ex. example@wri.org"
                          type="text"
                        />
                        <ErrorDisplay
                          name="email"
                          errors={errors}
                        />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            First Name {required}
                          </label>
                          <Input
                            {...register(
                              'firstName'
                            )}
                            placeholder="ex. Joe"
                            type="text"
                          />
                          <ErrorDisplay
                            name="firstName"
                            errors={errors}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Last Name {required}
                          </label>
                          <Input
                            {...register(
                              'lastName'
                            )}
                            placeholder="ex. Doe"
                            type="text"
                          />
                          <ErrorDisplay
                            name="lastName"
                            errors={errors}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Country {required}
                        </label>
                        <SimpleSelect
                          name="country"
                          formObj={formObj}
                          options={countries.map(
                            (c) => ({
                              label: c.name,
                              value: c.iso,
                            })
                          )}
                          maxWidth="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Affiliation {required}
                        </label>
                        <SimpleSelect
                          name="affiliation"
                          formObj={formObj}
                          options={affiliationOptions.map(
                            (o) => ({
                              label: o,
                              value: o,
                            })
                          )}
                          placeholder="Section/Affiliation*"
                          maxWidth="w-full"
                        />
                      </div>

                      {affiliation?.value === 'Other' && (
                        <>
                          <label className="block text-sm font-medium text-gray-700">
                            Please describe your
                            affiliation
                          </label>
                          <Input
                            {...register(
                              'otherAffiliation'
                            )}
                            type="text"
                            placeholder="Describe your affiliation"
                          />
                        </>
                      )}
                      <ErrorDisplay
                        name="affiliation"
                        errors={errors}
                      />

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Organization (optional)
                          </label>
                          <Input
                            {...register(
                              'organization'
                            )}
                            type="text"
                            placeholder="Your organization"
                          />
                          <ErrorDisplay
                            name="organization"
                            errors={errors}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Job Title (optional)
                          </label>
                          <Input
                            {...register(
                              'jobTitle'
                            )}
                            type="text"
                            placeholder="Your job title"
                          />
                          <ErrorDisplay
                            name="jobTitle"
                            errors={errors}
                          />
                        </div>
                      </div>

                      {[
                        'global-forest-watch',
                        'land-carbon-lab',
                      ].includes(
                        dataset.organization?.name ?? ''
                      ) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Interests
                            </label>
                            <MulText
                              name="interests"
                              formObj={formObj}
                              options={interestOptions.map(
                                (o) => ({
                                  label: o,
                                  value: o,
                                })
                              )}
                              title="I'm interested in (optional)"
                            />
                          </div>
                        )}
                      <div>
                        <label className="text-sm text-gray-500">
                          By sharing your contact
                          information you agree to
                          receive updates from WRI.
                          You can change your
                          communication preferences at
                          any time. We respect your
                          privacy and never share your
                          information with other
                          parties.
                        </label>
                      </div>
                      {downloadButton}
                      <div className="mt-6">
                        {skipButton}
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
