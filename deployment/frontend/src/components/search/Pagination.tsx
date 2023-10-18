import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'

export default function Pagination() {
  return (
    <div className="flex items-center justify-between bg-white py-3">
      <div className="flex sm:flex-1 sm:items-center sm:justify-between mx-auto">
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <a
              href="#"
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-black  ring-inset  hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">First</span>
              <ChevronDoubleLeftIcon className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="#"
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-black  ring-inset  hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </a>
            {/* Current: "z-10 bg-amber-400 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400", Default: "text-black  ring-inset  hover:bg-gray-50 focus:outline-offset-0" */}
            <a
              href="#"
              aria-current="page"
              className="relative z-10 inline-flex items-center bg-amber-400 px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            >
              1
            </a>
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-black  ring-inset  hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              2
            </a>
            <a
              href="#"
              className="relative hidden items-center px-4 py-2 text-sm font-semibold text-black  ring-inset  hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex"
            >
              3
            </a>
            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700  ring-inset  focus:outline-offset-0">
              ...
            </span>
            <a
              href="#"
              className="relative hidden items-center px-4 py-2 text-sm font-semibold text-black  ring-inset  hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex"
            >
              8
            </a>
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-black  ring-inset  hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              9
            </a>
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-black  ring-inset  hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              10
            </a>
            <a
              href="#"
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-black  ring-inset  hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="#"
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-black  ring-inset  hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Last</span>
              <ChevronDoubleRightIcon className="h-5 w-5" aria-hidden="true" />
            </a>
          </nav>
        </div>
      </div>
    </div>
  )
}
