import { UseFormReturn } from 'react-hook-form'
import { ApplicationFormType } from '@/schema/application.schema'
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { Input } from '@/components/_shared/SimpleInput'
import { TextArea } from '@/components/_shared/SimpleTextArea'
import { ImageUploader } from '../../_shared/ImageUploader'
import { UploadResult } from '@uppy/core'
import DefaultTooltip from '@/components/_shared/Tooltip'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

export default function ApplicationForm({
  formObj,
  editing = false,
}: {
  formObj: UseFormReturn<ApplicationFormType>
  editing?: boolean
}) {
  const {
    register,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = formObj
  return (
    <div className="grid grid-cols-1 items-start gap-x-12 gap-y-4 py-5 lg:grid-cols-2 xxl:gap-x-24">
      <div className="flex flex-col justify-start gap-y-4">
        <InputGroup label="Title" required>
          <Input
            {...register('title')}
            placeholder="My Application"
            required
            type="text"
          />
          <ErrorDisplay name="title" errors={errors} />
        </InputGroup>
        <InputGroup label="URL" required>
          <Input
            {...register('name')}
            disabled={editing}
            placeholder="name-of-application"
            icon={
              <DefaultTooltip content="Please choose a URL that is not already in use for another Topic, Team, or Application.">
                <InformationCircleIcon className="z-10 h-4 w-4 text-gray-300" />
              </DefaultTooltip>
            }
            type="text"
            className="pl-[4.6rem] lg:pl-[6.4rem]"
          >
            <span className="absolute inset-y-0 left-5 flex items-center pr-3 sm:text-sm sm:leading-6">
              /applications/
            </span>
          </Input>
          <ErrorDisplay name="name" errors={errors} />
        </InputGroup>
        <InputGroup
          label="Image"
          className="items-start justify-start gap-x-[2.7rem]"
        >
          <div className="col-span-full lg:col-span-2">
            <div className="w-[11rem]">
              <ImageUploader
                clearImage={() => setValue('image_url', '')}
                tooltip="Appears on /applications, /applications/application-name, and homepage carousels. We recommend a horizontal image between 5-10 MB."
                defaultImage={
                  watch('image_url') &&
                  watch('image_display_url')
                }
                onUploadSuccess={(response: UploadResult) => {
                  const url =
                    response.successful[0]?.uploadURL ??
                    null
                  const name = url ? url.split('/').pop() : ''
                  setValue('image_url', name)
                }}
              />
            </div>
          </div>
        </InputGroup>
      </div>
      <div className="flex flex-col justify-start gap-y-4">
        <InputGroup
          label="Description"
          labelClassName="pt-[0.9rem]"
          className="items-start"
          required
        >
          <TextArea
            placeholder="Description"
            {...register('description')}
            type="text"
            className="h-[8.4rem]"
            icon={
              <DefaultTooltip content="Long form description of the application and its purpose.">
                <InformationCircleIcon className="mb-auto mt-2 h-5 w-5 text-gray-300" />
              </DefaultTooltip>
            }
          />
          <ErrorDisplay name="description" errors={errors} />
        </InputGroup>
        <InputGroup label="Contact URL" required>
          <Input
            {...register('contact_url')}
            placeholder="https://wri.org"
            required
            type="text"
            icon={
              <DefaultTooltip content="Link to the preferred way to reach out to the application’s support team. This could be a “Contact Us” form or a “mailto:app-help@wri.org” style link.">
                <InformationCircleIcon className="mb-auto mt-2 h-5 w-5 text-gray-300" />
              </DefaultTooltip>
            }
          />
          <ErrorDisplay name="contact_url" errors={errors} />
        </InputGroup>
        <InputGroup label="Homepage URL" required>
          <Input
            {...register('homepage_url')}
            placeholder="https://wri.org"
            required
            type="text"
            icon={
              <DefaultTooltip content="Homepage of the application, typically the landing page or root of the application’s web domain.">
                <InformationCircleIcon className="mb-auto mt-2 h-5 w-5 text-gray-300" />
              </DefaultTooltip>
            }
          />
          <ErrorDisplay name="homepage_url" errors={errors} />
        </InputGroup>
      </div>
      <div className="flex flex-col justify-start gap-y-4">
        <InputGroup
          label="Help URL"
          labelClassName="pt-[0.9rem]"
          className="items-start"
        >
          <Input
            {...register('help_url')}
            placeholder="https://wri.org"
            type="text"
            icon={
              <DefaultTooltip content="Link to self-service documentation and user support resources. This could be the application's “About” page or “FAQs”">
                <InformationCircleIcon className="mb-auto mt-2 h-5 w-5 text-gray-300" />
              </DefaultTooltip>
            }
          />
          <ErrorDisplay name="help_url" errors={errors} />
        </InputGroup>
      </div>
    </div>
  )
}
