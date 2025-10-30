import { BrowserRouter } from 'react-router-dom'
import Providers from '@/store/Provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
    
    
export const AppWrapper=({children})=>{

    return(
        <>
            <QueryClientProvider client={queryClient}>
                <Providers>
                    <BrowserRouter>
                        {children}
                    </BrowserRouter> 
                </Providers>
            </QueryClientProvider>
        </>
    
    )

}