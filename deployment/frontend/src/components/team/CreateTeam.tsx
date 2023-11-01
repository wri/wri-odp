import Container from "../_shared/Container";
import { InputGroup } from "../_shared/InputGroup";
import Select from "../_shared/SimpleSelect";
import { Input } from "../_shared/SimpleInput";
import UploadButton from "../datasets/sections/datafiles/Upload";
import { Breadcrumbs } from "../_shared/Breadcrumbs";

const links = [
  { label: "Teams", url: "/teams", current: false },
  { label: "Create a team", url: "/teams/new", current: true },
];

export default function CreateTeam() {
  return (
    <>
      <Breadcrumbs links={links} />
      <Container className="mb-20 font-acumin">
        <h1 className="mb-[2rem] text-[1.57rem] font-semibold">
          Create a team
        </h1>
        <div className="w-full border-b border-blue-800 shadow">
          <div className="px-8">
            <div className="grid grid-cols-1 items-start gap-x-24 gap-y-4 py-5 md:grid-cols-2">
              <div className="flex flex-col justify-start gap-y-4">
                <InputGroup label="Name" required>
                  <Input
                    name="name"
                    maxWidth="100%"
                    placeholder="Name"
                    type="text"
                  />
                </InputGroup>
                <InputGroup label="Title" required>
                  <Input
                    name="title"
                    maxWidth="100%"
                    placeholder="My dataset"
                    type="text"
                  />
                </InputGroup>
                <InputGroup label="URL" required>
                  <Input
                    name="url"
                    maxWidth="100%"
                    placeholder="name-of-dataset"
                    type="text"
                    className="!pl-[4.8rem]"
                  >
                    <span className="absolute inset-y-0 left-5 flex items-center pr-3 sm:text-sm sm:leading-6">
                      /dataset/
                    </span>
                  </Input>
                </InputGroup>
                <InputGroup label="Image" className="justify-start gap-x-[2.7rem]" required>
                  <div className="col-span-full lg:col-span-2">
                    <div className="w-[11rem]">
                      <UploadButton text="Upload an image" />
                    </div>
                  </div>
                </InputGroup>
              </div>
              <div className="flex flex-col justify-start gap-y-4">
                <InputGroup
                  label="Description"
                  labelClassName="pt-[0.9rem]"
                  className="items-start"
                >
                  <Input
                    maxWidth="100%"
                    placeholder="Description"
                    name="Description"
                    type="text"
                    as="textarea"
                    className="h-[8.4rem]"
                  />
                </InputGroup>
                <InputGroup
                  label="Parent"
                  labelClassName="pt-[0.9rem]"
                  className="items-start"
                >
                  <Select
                    maxWidth="100%"
                    options={[{ label: "Parent 1", value: "PARENT_1" }]}
                    placeholder="Select a parent"
                  />
                </InputGroup>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
