function DataItemTable({dataItem}) {
  return (
    <>
      {dataItem && (
        <>
          <div className='table__container'>
            {dataItem.items && dataItem.items.length > 0 && (
              <div className='table__header table__row'>
                <div className='table__cell'>Date</div>
                <div className='table__cell'>{dataItem.items[0]?.unit}</div>
              </div>
            )}
            {dataItem.data && dataItem.data.length > 0 && (
              <div className='table__content'>
                {dataItem.data.map(dailyData => (
                  <div key={dailyData[0]} className='table__row'>
                    <div className='table__cell'>{new Date(dailyData[0] * 1000).toLocaleString("it-it", {day: 'numeric', month: 'numeric', year: 'numeric',hour: '2-digit', minute: '2-digit'})}</div>
                    <div className='table__cell'>{dailyData[1]}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}

export default DataItemTable;
