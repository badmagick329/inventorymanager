import { OrderResponse } from '@/types';

function createMap(orders: OrderResponse[]) {
  const itemAndCost = new Map();
  for (const order of orders) {
    const savedValue = itemAndCost.get(order.name);
    if (savedValue) {
      itemAndCost.set(
        order.name,
        savedValue + order.pricePerItem * order.quantity
      );
      continue;
    }

    itemAndCost.set(order.name, order.pricePerItem * order.quantity);
  }
  return itemAndCost;
}

function getLabelsAndDataFromMap(map: Map<string, number>) {
  const labels = [] as string[];
  const data = [] as number[];
  map.forEach((cost, name) => {
    labels.push(name);
    data.push(cost);
  });
  return {
    labels,
    data,
  };
}

function createChartDataObject(
  labels: string[],
  data: number[],
  n: number = 6
) {
  n = Math.min(n, 6);
  return {
    labels: labels.slice(0, n),
    title: {
      display: true,
      text: 'Chart.js Pie Chart',
    },
    datasets: [
      {
        label: 'Order Cost',
        data: data.slice(0, n),
        backgroundColor: [
          'rgba(255, 99, 132, 0.4)',
          'rgba(54, 162, 235, 0.4)',
          'rgba(255, 206, 86, 0.4)',
          'rgba(75, 192, 192, 0.4)',
          'rgba(153, 102, 255, 0.4)',
          'rgba(255, 159, 64, 0.4)',
        ].slice(0, n),
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ].slice(0, n),
        borderWidth: 1,
      },
    ],
  };
}

export function prepareChartData(orders: OrderResponse[]) {
  const itemAndCost = createMap(orders);

  const sortedItemAndCost = new Map(
    [...itemAndCost.entries()].sort(
      (a: [string, number], b: [string, number]) => b[1] - a[1]
    )
  );

  const { labels, data } = getLabelsAndDataFromMap(sortedItemAndCost);

  return createChartDataObject(labels, data);
}
