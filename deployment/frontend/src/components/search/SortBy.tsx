import Select from "../_shared/Select";

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
          <Select
            options={[
              { id: 1, label: "1" },
              { id: 2, label: "2" },
              { id: 3, label: "3" },
            ]}
          />
        </div>
        <div className="flex items-center gap-x-3">
          <div className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black">
            Sort by
          </div>
          <Select
            options={[
              { id: 1, label: "Relevance" },
              { id: 2, label: "Name" },
              { id: 3, label: "Title" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
