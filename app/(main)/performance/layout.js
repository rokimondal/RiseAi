import { BarLoader } from "react-spinners";
import { Suspense } from "react";

const layout = ({ children }) => {
    return (
        <div className='px-5'>
            <Suspense fallback={<>
                <h1 className='text-3xl md:text-6xl font-bold gradient-title mb-5'>
                    Performance Dashboard
                </h1>
                <BarLoader className="mt-4" width={"100%"} color="gray" />
            </>}>{children}</Suspense>
        </div>
    )
}

export default layout