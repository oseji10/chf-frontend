import { Bar, defaults } from "react-chartjs-2";


defaults.plugins.tooltip.enabled=true;
defaults.plugins.legend.position='bottom';
const BarChart = ({labels, data, title=""}) => {
  return (
    <div className="py-2">
      <Bar
        data={{
          labels: labels,
          datasets: [
            {
                label: title,
                data: data,
                backgroundColor: [
                  "rgba(255, 99, 132, 1)",
                  "rgba(54, 162, 235, 1)",
                  "rgba(255, 206, 86, 1)",
                  "rgba(75, 192, 192, 1)",
                  "rgba(153, 102, 255, 1)",
                  "rgba(255, 159, 64, 1)",
                ],
                borderColor:'rgba(153, 102, 255, 1)'
            }
          ],
        }}
        height={400}
        width={600}
        options={{
          maintainAspectRatio: false,
          scales: {
            y: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
          legend: {
            labels: {
              fontSize: 9
            }
          }
        }}
      />
    </div>
  );
};

export default BarChart;
