import { useState, useEffect } from 'react';
import './App.css';

import DataChart from './DataChart';
import DataItemTable from './DataItemTable';
import PerformanceRatioTable from './PerformanceRatioTable';

const DOMAIN_URL = 'https://devext.higeco.com';
const API_TOKEN = '3862dce514e632ef9ac9b278f5000f0b';
const PLANT_NAME = 'Impianto';
const DEVICE_NAME = 'Impianto';
const LOG_NAME = 'Fotovoltaico';
const ITEM_NAME_1 = 'Energia';
const ITEM_NAME_2 = 'Irraggiamento';
export const NUM_OF_DAYS_OF_LOGGED_DATA = 7;
const SAMPLING_TIME_OF_LOGGED_DATA_IN_SECONDS = 3600;
const POTENZA_NOMINALE = 4; // in kW

function App() {
  const [token, setToken] = useState(null);
  const [plant, setPlant] = useState(null);
  const [device, setDevice] = useState(null);
  const [log, setLog] = useState(null);
  const [item1, setItem1] = useState(null); // will contain ITEM_NAME_1 object
  const [item2, setItem2] = useState(null); // will contain ITEM_NAME_2 object
  const [dataItem1, setDataItem1] = useState([]);
  const [dataItem2, setDataItem2] = useState([]);
  const [dataItem1ForChart, setDataItem1ForChart] = useState([]); // will contain the dataItem1 in the structure needed to draw the chart
  const [dataItem2ForChart, setDataItem2ForChart] = useState([]); // will contain the dataItem2 in the structure needed to draw the chart
  const [daysSummary, setDaysSummary] = useState([]); // will contain data to calculate the performance ratio
  const [daysSummaryForChart, setDaysSummaryForChart] = useState([]); // will contain the daysSummary in the structure needed to draw the chart  

  // on initial render get authorization token
  useEffect(() => {
    const getToken = async () => {
      const response = await fetch(`${DOMAIN_URL}/api/v1/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({apiToken: API_TOKEN})
      });
      const data = await response.json();
      setToken(data.token);
    };

    getToken();
  }, []);

  // when token is obtained, retrieve plants and store Impianto plant
  useEffect(() => {
    const getPlant = async () => {
      const response = await fetch(`${DOMAIN_URL}/api/v1/plants`, {
        method: 'GET',
        headers: {
          'authorization': token
        }
      });
      const data = await response.json();
      setPlant(data.filter(plant => plant.name === PLANT_NAME)[0]);
    };

    // call it only when token is populated
    if (token) {
      getPlant();
    }
  }, [token]);

  // when plants is obtained, retrieve devices and store Impianto device
  useEffect(() => {
    const getDevice = async () => {
      const response = await fetch(`${DOMAIN_URL}/api/v1/plants/${plant.id}/devices`, {
        method: 'GET',
        headers: {
          'authorization': token
        }
      });
      const data = await response.json();
      setDevice(data.filter(device => device.name === DEVICE_NAME)[0]);
    };

    // call it only when token and plant are populated
    if (token && plant) {
      getDevice();
    }
  }, [token, plant]);

  // when device is obtained, retrieve logs and store Fotovoltaico log
  useEffect(() => {
    const getLog = async () => {
      const response = await fetch(`${DOMAIN_URL}/api/v1/plants/${plant.id}/devices/${device.id}/logs`, {
        method: 'GET',
        headers: {
          'authorization': token
        }
      });
      const data = await response.json();
      setLog(data.filter(log => log.name === LOG_NAME)[0]);
    };

    // call it only when token and plant and device are populated
    if (token && plant && device) {
      getLog();
    }
  }, [token, plant, device]);

  // when log is obtained, retrieve items and store Energia and Irradiamento items
  useEffect(() => {
    const getItems = async () => {
      const response = await fetch(`${DOMAIN_URL}/api/v1/plants/${plant.id}/devices/${device.id}/logs/${log.id}/items`, {
        method: 'GET',
        headers: {
          'authorization': token
        }
      });
      const data = await response.json();
      setItem1(data.filter(item => item.name === ITEM_NAME_1)[0]);
      setItem2(data.filter(item => item.name === ITEM_NAME_2)[0]);
    };

    // call it only when token and plant and device and log are populated
    if (token && plant && device && log) {
      getItems();
    }
  }, [token, plant, device, log]);

  // when items are obtained, retrieve log data for the last week for both items and store it
  useEffect(() => {
    const startingDateTimestampInMilliseconds = new Date().setDate(new Date().getDate() - NUM_OF_DAYS_OF_LOGGED_DATA);
    const startingDateTimestampInSeconds = Math.floor(startingDateTimestampInMilliseconds / 1000);
    const params = `from=${startingDateTimestampInSeconds}&samplingTime=${SAMPLING_TIME_OF_LOGGED_DATA_IN_SECONDS}`;


    const getLogData1 = async () => {
      const response = await fetch(`${DOMAIN_URL}/api/v1/getLogData/${plant.id}/${device.id}/${log.id}/${item1.id}?${params}`, {
        method: 'GET',
        headers: {
          'authorization': token
        }
      });
      const data = await response.json();
      setDataItem1(data);
    };

    const getLogData2 = async () => {
      const response = await fetch(`${DOMAIN_URL}/api/v1/getLogData/${plant.id}/${device.id}/${log.id}/${item2.id}?${params}`, {
        method: 'GET',
        headers: {
          'authorization': token
        }
      });
      const data = await response.json();
      setDataItem2(data);
    };

    // call it only when token and plant and device and log and item1 are populated
    if (token && plant && device && log && item1) {
      getLogData1();
    }
    // call it only when token and plant and device and log and item2 are populated
    if (token && plant && device && log && item2) {
      getLogData2();
    }

  }, [token, plant, device, log, item1, item2]);

  // compute PR per day
  useEffect(() => {
    if (dataItem1.data && dataItem2.data) {
      // populate days, without duplicates
      let _daysSummary = [];
      dataItem1.data?.forEach(hourlyData => {
        const hourlyDataDate = new Date(hourlyData[0]* 1000);
        const isAlreadyPresent = () => _daysSummary.find(day => day.date === hourlyDataDate.toLocaleDateString());
        if (!isAlreadyPresent()) {
          _daysSummary.push({date: hourlyDataDate.toLocaleDateString(), date_timestamp: hourlyData[0]});
        }
      })
      // populate min and max for each day
      _daysSummary.forEach(day => {
        const dailyData = dataItem1.data?.filter(hourlyData => day.date === new Date(hourlyData[0]* 1000).toLocaleDateString())
        const dailyMin = dailyData?.reduce((prev, curr) => prev[1] < curr[1] ? prev : curr);
        day.min = dailyMin[1]; // keep the value (first element is timestamp, second element is value)
        const dailyMax = dailyData?.reduce((prev, curr) => prev[1] > curr[1] ? prev : curr);
        day.max = dailyMax[1]; // keep the value (first element is timestamp, second element is value)
      });
      // populate normalized sum for each day
      _daysSummary.forEach(day => {
        const dailyData = dataItem2.data?.filter(hourlyData => day.date === new Date(hourlyData[0]* 1000).toLocaleDateString())
        const dailySum = dailyData?.reduce((partialSum, curr) => partialSum + curr[1]/1000, 0); // keep the value (first element is timestamp, second element is value)
        day.normalized_sum = Math.round((dailySum + Number.EPSILON) * 1000) / 1000; // round value to 3 decimals in a robust way
      });
      // populate PR for each day
      _daysSummary.forEach(day => {
        if (day.normalized_sum === 0) { // edge case when values are all zeros, need to handle it otherwise, during the pr calculation, zero will be used as divisor, resulting in Nan
          day.pr = 0;
        } else {
          const deltaT = SAMPLING_TIME_OF_LOGGED_DATA_IN_SECONDS / 3600; // sampling time in hours
          const pr = (day.max - day.min) / (POTENZA_NOMINALE * day.normalized_sum * deltaT);
          day.pr = Math.round((pr + Number.EPSILON) * 100 ) / 100; // round value to 3 decimals in a robust way
        }
      });
      setDaysSummary(_daysSummary);
    }
  }, [dataItem1, dataItem2]);

  useEffect(() => {
    // prepare data for chart 1
    const _dataItem1ForChart = [{'id': 'energia','data': []}]; 
    dataItem1.data?.forEach(hourlyData => _dataItem1ForChart[0].data.push({
      'x': new Date(hourlyData[0]* 1000).toLocaleString(),
      'y': hourlyData[1].toString()
    }));
    setDataItem1ForChart(_dataItem1ForChart);
  }, [dataItem1]);

  useEffect(() => {
    // prepare data for chart 2
    const _dataItem2ForChart = [{'id': 'irraggiamento','data': []}]; 
    dataItem2.data?.forEach(hourlyData => _dataItem2ForChart[0].data.push({
      'x': new Date(hourlyData[0]* 1000).toLocaleString(),
      'y': hourlyData[1].toString()
    }));
    setDataItem2ForChart(_dataItem2ForChart);
  }, [dataItem2]);

  useEffect(() => {
    // prepare data for chart performance ratio
    if (dataItem1.data && dataItem1.data.length > 0 && dataItem2.data && dataItem2.data.length > 0) {
      const _daysForChart = [{'id': 'pr', 'data': []}];
      daysSummary.forEach(day => _daysForChart[0].data.push({
        'x': new Date(day.date_timestamp * 1000).toLocaleString(),
        'y': day.pr.toString()
      }))
      setDaysSummaryForChart(_daysForChart);
    }
  }, [dataItem1, dataItem2, daysSummary]);

  const isLoadingData = () => {
    return dataItem1.length === 0 || dataItem2.length === 0; // not strong at all, if the api doesn't give back data then I will be stuck at the loading phase without showing an error
  };

  return (
    <>
      {isLoadingData() && (
        <div className='spinner__container'>
          <span className='spinner__icon'></span>
          <p className='spinner__text'>Retrieving data, please wait...</p>
        </div>
      )}
      {!isLoadingData() && (
        <div className='section__container'>
          {dataItem1.items && dataItem1.items.length > 0 && dataItem1ForChart && dataItem1ForChart.length > 0 && dataItem1ForChart[0].data && dataItem1ForChart[0].data.length > 0 && (
            <DataChart title={dataItem1.items[0]?.name} data={dataItem1ForChart} yAxisLabel={dataItem1.items[0]?.unit}></DataChart>
          )}
          <DataItemTable dataItem={dataItem1}></DataItemTable>
        </div>
      )}

      {!isLoadingData() && (
        <div className='section__container'>
          {dataItem2.items && dataItem2.items.length > 0 && dataItem2ForChart && dataItem2ForChart.length > 0 && dataItem2ForChart[0].data && dataItem2ForChart[0].data.length > 0 && (
            <DataChart title={dataItem2.items[0]?.name} data={dataItem2ForChart} yAxisLabel={dataItem2.items[0]?.unit}></DataChart>
          )}
          {dataItem2 && <DataItemTable dataItem={dataItem2}></DataItemTable>}
        </div>
      )}

      {!isLoadingData() && (
        dataItem1.items && dataItem1.items.length > 0 && dataItem2.items && dataItem2.items.length > 0 && daysSummary.length > 0 && (
          <>
            <DataChart title='Performance Ratio' data={daysSummaryForChart} yAxisLabel='Performance Ratio (%)' yMin='0' yMax='1' showTooltipTime={false}></DataChart>
            <PerformanceRatioTable data={daysSummary}></PerformanceRatioTable>
          </>
        )
      )}
    </>
  )
}

export default App;
