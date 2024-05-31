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

// Register the components with Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PopularProductsChart = () => {
  const { loading, error, data } = useQuery(GET_MOST_POPULAR_PRODUCTS);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Number of Times Added to Cart',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  });

  console.log("error:", error);
  console.log("loading:", loading);
  console.log("data:", data);

  useEffect(() => {
    console.log("Inside useEffect");

    if (data) {
      console.log("Data is available");
      if (data.mostPopularProducts) {
        console.log("mostPopularProducts is available");
        console.log("mostPopularProducts:", data.mostPopularProducts);

        // Map product names and counts
        const productNames = data.mostPopularProducts.map(product => product.name);
        const productCounts = data.mostPopularProducts.map(product => product.count);

        console.log("Product names:", productNames);
        console.log("Product counts:", productCounts);

        setChartData({
          labels: productNames,
          datasets: [
            {
              label: 'Number of Times Added to Cart',
              data: productCounts,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        });

        console.log("Chart data set");
      } else {
        console.error("mostPopularProducts is undefined");
      }
    } else {
      console.error("Data is undefined");
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <Bar data={chartData} />;
};

export default PopularProductsChart;
