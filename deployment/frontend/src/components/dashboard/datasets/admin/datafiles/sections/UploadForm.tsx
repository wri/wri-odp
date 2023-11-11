import { InputGroup } from "@/components/_shared/InputGroup";
import { Input } from "@/components/_shared/SimpleInput";
import SimpleSelect from "@/components/_shared/SimpleSelect";
import { TextArea } from "@/components/_shared/SimpleTextArea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_shared/Table";
import { MinusCircleIcon, PaperClipIcon } from "@heroicons/react/24/outline";

export function UploadForm({ removeFile }: { removeFile: () => void }) {
  return (
    <div className="flex flex-col gap-y-4 font-acumin">
      <div className="flex w-full justify-between bg-slate-100 px-6 py-3">
        <div className="flex items-center gap-x-2">
          <PaperClipIcon className="h-6 w-6 text-blue-800" />
          <span className="text-lg font-light text-black">
            referencetables.xlsx
          </span>
          <span className="text-right font-acumin text-xs font-normal leading-tight text-neutral-500">
            (3.2 MB)
          </span>
        </div>
        <div className="flex items-center justify-center gap-x-3">
          <div className="relative h-6 w-6">
            <img
              src="/icons/upload_loading.svg"
              alt=""
              className="absolute inset-0 h-full w-full animate-spin object-cover"
            />
            <span className="absolute left-1.5 top-2 font-acumin text-[0.475rem] font-medium leading-tight text-black">
              73%
            </span>
          </div>
          <button onClick={() => removeFile()}>
            <MinusCircleIcon className="h-6 w-6 text-red-500" />
          </button>
        </div>
      </div>
      <InputGroup label="Title" required className="whitespace-nowrap">
        <Input
          placeholder="Some name"
          name="title"
          type="text"
          maxWidth="max-w-[70rem]"
        />
      </InputGroup>
      <InputGroup label="Description" className="whitespace-nowrap">
        <TextArea
          placeholder="Add description"
          name="title"
          type="text"
          maxWidth="max-w-[70rem]"
        />
      </InputGroup>
      <InputGroup label="Format" className="whitespace-nowrap">
        <SimpleSelect
          name="format"
          placeholder="Select format"
          maxWidth="max-w-[70rem]"
          options={[
            { value: "csv", label: "CSV" },
            { value: "json", label: "JSON" },
            { value: "xml", label: "XML" },
          ]}
        ></SimpleSelect>
      </InputGroup>
      <PreviewTable />
    </div>
  );
}

const fields = [
  {
    field: "id",
    type: "int(1)",
    null: false,
    key: "MUL",
    default: "NULL",
  },
  {
    field: "id",
    type: "int(1)",
    null: false,
    key: "MUL",
    default: "NULL",
  },
  {
    field: "id",
    type: "int(1)",
    null: false,
    key: "MUL",
    default: "NULL",
  },
  {
    field: "id",
    type: "int(1)",
    null: false,
    key: "MUL",
    default: "NULL",
  },
];

function PreviewTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-neutral-50">
          <TableHead className="font-acumin text-xs font-semibold text-black">
            Field
          </TableHead>
          <TableHead className="font-acumin text-xs font-semibold text-black">
            Type
          </TableHead>
          <TableHead className="font-acumin text-xs font-semibold text-black">
            Null
          </TableHead>
          <TableHead className="font-acumin text-xs font-semibold text-black">
            Key
          </TableHead>
          <TableHead className="font-acumin text-xs font-semibold text-black">
            Default
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fields.map((field, index) => (
          <TableRow
            key={index}
            className={index % 2 != 0 ? "border-0 bg-[#FDFDFD]" : "border-0"}
          >
            <TableCell><input defaultValue={field.field} type="text" className="p-0 border-0 ring-0 ring-offset-0"/></TableCell>
            <TableCell><input defaultValue={field.type} type="text" className="p-0 border-0 ring-0 ring-offset-0"/></TableCell>
            <TableCell><select defaultValue={field.key}className="p-0 border-0 ring-0 ring-offset-0 appearance-none bg-none"><option value="YES">YES</option><option value="NO">NO</option></select></TableCell>
            <TableCell><input defaultValue={field.key} type="text" className="p-0 border-0 ring-0 ring-offset-0"/></TableCell>
            <TableCell><input defaultValue={field.default} type="text" className="p-0 border-0 ring-0 ring-offset-0"/></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
