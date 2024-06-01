import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { GET_MOST_POPULAR_PRODUCTS } from './apollo/definitions';
import Spinner from 'react-bootstrap/Spinner'; // Assuming you have react-bootstrap installed

// Register the components with Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const generateRandomColor = () => {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, 0.6)`;
};

const PopularProductsChart = () => {
  const { loading, error, data } = useQuery(GET_MOST_POPULAR_PRODUCTS, {
    pollInterval: 3000, // Poll every 3 seconds
  });
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Items currently most in demand',
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    if (data) {
      if (data.mostPopularProducts) {
        const productNames = data.mostPopularProducts.map(product => product.name);
        const productCounts = data.mostPopularProducts.map(product => product.count);
        const colors = productCounts.map(() => generateRandomColor());

        setChartData({
          labels: productNames,
          datasets: [
            {
              label: 'Items currently most in demand',
              data: productCounts,
              backgroundColor: colors,
              borderColor: colors.map(color => color.replace('0.6', '1')),
              borderWidth: 1,
            },
          ],
        });
      } else {
        console.error("mostPopularProducts is undefined");
      }
    } else {
      console.error("Data is undefined");
    }
  }, [data]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div style={{ maxWidth: '80%', margin: 'auto' }}>
      <Bar 
        data={chartData} 
        options={{
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += context.parsed.y;
                  }
                  return label;
                }
              }
            },
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Most Popular Products',
            },
          },
        }}
      />
    </div>
  );
};

export default PopularProductsChart;
