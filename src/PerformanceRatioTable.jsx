function PerformanceRatioTable({data}) {
    return (
      <>
        {data && data.length > 0 && (
          <>
            <div className='table__container'>
              <div className='table__header table__row'>
                <div className='table__cell'>Date</div>
                <div className='table__cell'>Performance Ratio (%)</div>
              </div>
              {data.map(dailyData => (
                <div key={dailyData.date} className='table__row'>
                  <div className='table__cell'>{dailyData.date}</div>
                  <div className='table__cell'>{dailyData.pr}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </>
    )
  }
  
  export default PerformanceRatioTable;
  