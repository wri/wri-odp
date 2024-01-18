import Spinner from './Spinner'

export default function Loading() {
    return (
        <div className="bg-lima-700 fixed bottom-0 left-0 right-0 top-0 z-50 flex h-screen w-full flex-col items-center justify-center overflow-hidden opacity-75">
            <Spinner className="text-wri-green w-12 h-12" />
            <h2 className="text-center text-xl font-semibold text-wri-green">
                Loading...
            </h2>
        </div>
    )
}
