import { ResponsiveLine } from '@nivo/line';
import { NUM_OF_DAYS_OF_LOGGED_DATA } from './App';

import { useWindowWidth } from './hooks';

function DataChart({title, data, yAxisLabel, yMin = 'auto', yMax = 'auto', showTooltipTime = true}) {
  const [windowWidth] = useWindowWidth();

  return (
    <>
      {title && (
        <p className='chart__title'>{title}</p>
      )}
      <div className='chart__container'>
        <ResponsiveLine
          data={data}
          margin={{ top: 30, right: 30, bottom: 60, left: 60 }}
          xScale={{
            type: "time",
            format: "%d/%m/%Y, %H:%M:%S",
            useUTC: false
          }}
          xFormat="time:%d/%m/%Y, %H:%M:%S"
          yScale={{
            type: 'linear',
            min: yMin,
            max: yMax,
            stacked: true,
            reverse: false
          }}
          yFormat=" >-.2f"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            truncateTickAt: 0,
            format: '%b %d',
            tickValues: windowWidth > 575 ? NUM_OF_DAYS_OF_LOGGED_DATA : (Math.ceil(NUM_OF_DAYS_OF_LOGGED_DATA / 2)) // other possible values are 'every day' and 'every two days', but there's an known issue of showing future dates when close to next month
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: yAxisLabel,
            legendOffset: -50,
            legendPosition: 'middle',
            truncateTickAt: 0
          }}
          enableGridX={true}
          enableGridY={true}
          lineWidth={1}
          pointSize={2}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          enablePointLabel={false}
          pointLabel="data.yFormatted"
          pointLabelYOffset={-12}
          enableTouchCrosshair={true}
          tooltip={({ point }) => {
            return (
              <div
              style={{
                background: 'white',
                padding: '9px 12px',
                fontSize: '13px',
                border: '1px solid #ccc',
              }}
              >
              <div>Date: {point.data.x.toLocaleDateString()}</div>
              {showTooltipTime && (
                <div>Time: {point.data.x.toLocaleString("it-it", {hour: '2-digit', minute: '2-digit'})}</div>
              )}
              <div>{yAxisLabel}: {point.data.yFormatted}</div>
              </div>
            )
          }} 
          useMesh={true}
        />
      </div>
    </>
  )
}

export default DataChart;
