


export default function PageLoading({
    size = 24,
    color = 'blue-500',
    borderWidth = 5,
    speed = 'spin',
    bgOpacity = 0.1,
    backdrop = true,
    text
  }){
    console.log("b=ndwhkas")
    const sizeClass = `w-${size} h-${size}`;
    const borderClass = `border-${borderWidth} border-${color} border-t-transparent`;
    const spinClass = `animate-${speed}`;
    return (
        <div
        style={{zIndex:"10000000"}}
        className={`${
          backdrop ? 'pageLoading' : ''
        }`}
      >
        <div
          className={`${sizeClass} ${borderClass} rounded-full ${spinClass}`}
        ></div>
        <h4 className="mt-3">{text}...</h4>
      </div>
    );
}