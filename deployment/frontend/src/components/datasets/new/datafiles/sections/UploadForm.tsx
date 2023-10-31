import { InputGroup } from "@/components/_shared/InputGroup";
import { Input } from "@/components/_shared/SimpleInput";
import SimpleSelect from "@/components/_shared/SimpleSelect";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/_shared/Table";

export function UploadForm() {
  return (
    <div className="flex flex-col gap-y-4">
      <InputGroup label="Title" required className="whitespace-nowrap">
        <Input
          placeholder="Some name"
          name="title"
          type="text"
          maxWidth="max-w-[70rem]"
        />
      </InputGroup>
      <InputGroup label="Description" className="whitespace-nowrap">
        <Input
          placeholder="Add description"
          name="title"
          as="textarea"
          type="text"
          maxWidth="max-w-[70rem]"
        />
      </InputGroup>
      <InputGroup label="Format" className="whitespace-nowrap">
        <SimpleSelect
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
          <TableHead className="text-black text-xs font-semibold font-acumin">Field</TableHead>
          <TableHead className="text-black text-xs font-semibold font-acumin">Type</TableHead>
          <TableHead className="text-black text-xs font-semibold font-acumin">Null</TableHead>
          <TableHead className="text-black text-xs font-semibold font-acumin">Key</TableHead>
          <TableHead className="text-black text-xs font-semibold font-acumin">Default</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fields.map((field, index) => (
          <TableRow key={index} className={index % 2 != 0 ? 'bg-[#FDFDFD] border-0' : 'border-0'}>
            <TableCell>
              {field.field}
            </TableCell>
            <TableCell>{field.type}</TableCell>
            <TableCell>{field.null ? "YES" : "NO"}</TableCell>
            <TableCell>{field.key}</TableCell>
            <TableCell>{field.default}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
