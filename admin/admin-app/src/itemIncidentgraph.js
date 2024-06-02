import React, { useEffect } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { GET_REVIEW_METRICS, SUBSCRIBE_TO_REVIEW_UPDATES, SUBSCRIBE_TO_REVIEW_FLAGGED, SUBSCRIBE_TO_REVIEW_DELETED } from './apollo/definitions';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, Typography } from '@mui/material';

const ReviewMetrics = () => {
  const { loading, error, data, refetch } = useQuery(GET_REVIEW_METRICS, {
    pollInterval: 3000,
  });

  useSubscription(SUBSCRIBE_TO_REVIEW_UPDATES, {
    onSubscriptionData: () => {
      refetch();

    }
  });

  useSubscription(SUBSCRIBE_TO_REVIEW_FLAGGED, {
    onSubscriptionData:  () => {
      refetch();
    }
  });

  useSubscription(SUBSCRIBE_TO_REVIEW_DELETED, {
    onSubscriptionData: () => {
      refetch();
    }
  });

  useEffect( () => {
    refetch();

  }, [refetch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :</p>;

  const dataForChart = data.reviewMetrics.map(metric => ({
    productID: metric.productID,
    name: metric.name,
    totalReviews: metric.totalReviews,
    flaggedReviews: metric.flaggedReviews,
    deletedReviews: metric.deletedReviews
  }));

  return (
    <Card sx={{ p: 3, mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Incident Metric
        </Typography>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <div style={{ width: '1500px' }}>
            <BarChart
              width={1700}
              height={400}
              data={dataForChart}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" label={{ value: "Product ID", position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Number of Reviews', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '30px' }} />
              <Bar dataKey="totalReviews" fill="#8884d8" name="Total Reviews" />
              <Bar dataKey="flaggedReviews" fill="#82ca9d" name="Flagged Reviews" />
              <Bar dataKey="deletedReviews" fill="#ff8042" name="Deleted Reviews" />
            </BarChart>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewMetrics;
