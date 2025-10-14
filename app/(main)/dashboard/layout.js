import { BarLoader } from "react-spinners";
import { Suspense } from "react";

const layout = ({ children }) => {
    return (
        <div className='px-5'>
            <div className='flex justify-between items-center mb-5'>
                <h1 className='text-3xl md:text-6xl font-bold gradient-title'> Industry Insights</h1>
            </div>
            <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="gray" />}>{children}</Suspense>
        </div>
    )
}

export default layout