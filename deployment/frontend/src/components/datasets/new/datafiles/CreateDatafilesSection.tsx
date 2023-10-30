import { FolderPlusIcon } from "@heroicons/react/24/outline";
import { Accordion } from "../Accordion";
import { Tab } from "@headlessui/react";
import {
  BuildLayerTab,
  LinkExternalTab,
  UploadTab,
} from "./CreateDatafileTabs";
import { LinkExternalForm } from "./sections/LinkExternalForm";
import { UploadForm } from "./sections/UploadForm";

export function CreateDataFilesSection() {
  return (
    <Accordion
      icon={<FolderPlusIcon className="h-7 w-7" />}
      title="Add a data file"
    >
      <Tab.Group>
        <Tab.List
          as="div"
          className="grid max-w-[35rem] grid-cols-3 gap-x-3 py-4 "
        >
          <UploadTab />
          <LinkExternalTab />
          <BuildLayerTab />
        </Tab.List>
        <Tab.Panels as="div" className="mt-2">
          <Tab.Panel>
            <UploadForm />
          </Tab.Panel>
          <Tab.Panel>
            <LinkExternalForm />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </Accordion>
  );
}
