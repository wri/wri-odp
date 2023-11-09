import SimpleSelect from "../_shared/SimpleSelect";

export default function SortBy() {
  return (
    <div className="flex gap-y-2 lg:items-center items-start flex-col lg:flex-row justify-between mb-5 mt-6">
      <div className="font-['Acumin Pro SemiCondensed'] text-xl font-semibold text-black">
        236 results
      </div>
      <div className="flex items-center gap-x-2">
        <div className="flex items-center gap-x-3">
          <div className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black">
            Show
          </div>
          <SimpleSelect
            placeholder="Select"
            name="show"
            options={[
              { value: '1', label: "1", default: true },
              { value: '2', label: "2" },
              { value: '3', label: "3" },
            ]}
          />
        </div>
        <div className="flex items-center gap-x-3">
          <div className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black">
            Sort by
          </div>
          <SimpleSelect
            name="sort_by"
            placeholder="Sort by"
            options={[
              { value: '1', label: "Relevance", default: true },
              { value: '2', label: "Name" },
              { value: '3', label: "Title" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
