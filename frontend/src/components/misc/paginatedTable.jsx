import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { IoCloseSharp } from "react-icons/io5";
import { RiDeleteBin2Fill } from "react-icons/ri";


export function DataTable({
  columns,
  data,
 setTableArr,
 setWeekDayArr
}) {
 const [cleanedData,setCleanedData]=useState([])
//  useEffect(()=>{
//     if (!data?.length) return
    
//         const cleaned=data.map((item)=>{
//             const positions=item.position==="1"?"1st":item.position==="2"?"2nd":item.position==="3"?"3rd":"4th";
//             return{
//                 position:positions,
//                 weekday:item.weekday,
//                 no:item.no
//             }
//         })

//         setCleanedData(cleaned)


//   },[data])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
        pagination:{
            pageIndex: 0,  // current page
            pageSize: 5,   // rows per page
        },
    }
  })

  const removeRow=(e,row)=>{
    console.log(row.original)
    setTableArr((prev)=>{
        return prev.filter(item=>item!==row.original)
    })
    const str=`${row.original.position.toUpperCase()}${" "}${row.original.weekday.slice(0,2).toUpperCase()}`
    console.log(str)
    setWeekDayArr((prev)=>{
      return prev.filter(item=>item!==str)
    })
  }

  return (
    <div>
      <div className="overflow-hidden rounded-md border">
            <Table  className="border-border border-b">
                <TableCaption className="text-muted-foreground text-center">A list of your recent invoices.</TableCaption>
                <TableHeader className="bg-blue-900 text-white">
                <TableRow className=" border-b hover:bg-blue-900 border-border">
                    <TableHead className="w-[150px] font-semibold text-center">Position</TableHead>
                    <TableHead className="text-right font-semibold text-center ">Weekday</TableHead>
                    <TableHead className="w-[50px] font-semibold text-right">Delete</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                    {table.getPaginationRowModel().rows.length ? (
                        table.getPaginationRowModel().rows.map((row, key) => (
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell, keyy,arr) => {
                                return(
                                    <TableCell className={`font-medium text-black text-center }`} key={cell.id}>
                                        {cell.column.id==="remove"?( 
                                            <RiDeleteBin2Fill className="delete-bin" onClick={(e)=>removeRow(e,row)} size={20}/>
                                        ):(
                                            <div>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </div>
                                        )}
                                    </TableCell>
                                )
                            })}
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center text-muted-foreground"
                        >
                            No results.
                        </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="md"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}