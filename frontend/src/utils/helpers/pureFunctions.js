import { persistor } from "@/store/store";



export const getDetailsFromTimestamp=(timestamp)=> {
  const date= new Date(timestamp);
  const hour=date.getHours()
  const day=date.getDay()
  const minute=date.getMinutes()

  return {day,hour,minute}
}

export function formatDateWithOrdinal(isoString) {
const date = new Date(isoString);

const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const weekday = date.toLocaleString("en-US", { weekday: "long" });
  const year = date.getFullYear();
  const hour=date.getHours()
  const minute=date.getMinutes()
  const min=minute===0?"00":minute

  const suffix =
    day % 10 === 1 && day !== 11 ? "st" :
    day % 10 === 2 && day !== 12 ? "nd" :
    day % 10 === 3 && day !== 13 ? "rd" : "th";

  const ordinalDate=day+suffix

  return {weekday,ordinalDate,month,year,hour,min,day}
}

export const sortWeekdays=(weekdaysArr)=>{
  const order=["sun","mon","tue","wed","thu","fri","sat"]
  const sortedDays = [...weekdaysArr].sort((a, b) => {
    return order.indexOf(a) - order.indexOf(b);
  });

  
  console.log(sortedDays);

  return sortedDays
  

}

export const handleAllLogout = () => {
  // deleteCookies();
  persistor.pause();
  persistor.flush().then(() => {
    return persistor.purge();
  });
  location.reload();
};

export function getEarliestDate(isoDates) {
  if (!isoDates?.length) return null;
  return isoDates.reduce((a, b) => (a < b ? a : b));
}
