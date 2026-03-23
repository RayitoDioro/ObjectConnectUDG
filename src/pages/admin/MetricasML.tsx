import { useEffect, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Box,
  Button,
  VStack,
  HStack,
  Spinner,
  Text,
  Heading,
} from "@chakra-ui/react";

interface APIPoint {
  x: number;
  y: number;
  cluster: number;
  title?: string;
  description?: string;
  category?: string;
}

interface APICentroid {
  x: number;
  y: number;
  cluster?: number;
}

interface ClusterPoint {
  x: number;
  y: number;
  cluster: number;
  titulo?: string;
  descripcion?: string;
  categoria?: string;
  isCentroid?: boolean;
}

interface KMeansMetrics {
  sbert_model: string;
  vector_dimension: number;
  vector_count: number;
  num_categories?: number;
  k_clusters?: number;
  silhouette_score: number;
  davies_bouldin_index?: number;
  calinski_harabasz_index?: number;
  normalized_mutual_info?: number;
  cluster_distribution?: Record<string, number>;
  inertia: number;
  last_sync: string;
}

const CLUSTER_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#8dd1e1",
  "#d084d0",
  "#82d982",
  "#ffa07a",
];

interface TooltipPayload {
  payload: ClusterPoint;
}

// Componente personalizado para el Tooltip
const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box
        bg="white"
        p={4}
        borderRadius="lg"
        boxShadow="2xl"
        border="2px solid #4299E1"
        maxW="400px"
        zIndex={1000}
      >
        {/* Título del post */}
        <Text
          fontWeight="bold"
          fontSize="md"
          mb={2}
          color="brand.blue"
          noOfLines={2}
        >
          {data.titulo || "Punto sin información"}
        </Text>

        {/* Categoría */}
        {data.categoria && (
          <Box bg="blue.50" p={2} borderRadius="md" mb={2}>
            <Text fontSize="xs" color="blue.700" fontWeight="bold">
              📁 Categoría:{" "}
              <span style={{ fontWeight: "normal" }}>{data.categoria}</span>
            </Text>
          </Box>
        )}

        {/* Descripción */}
        {data.descripcion && (
          <Box bg="gray.50" p={2} borderRadius="md" mb={2}>
            <Text fontSize="xs" color="gray.700" whiteSpace="pre-wrap">
              📝 {data.descripcion}
            </Text>
          </Box>
        )}

        {/* Información técnica */}
        <Box borderTop="1px solid #E2E8F0" pt={2} mt={2}>
          <Text fontSize="xs" color="gray.600">
            📍 Posición: ({data.x?.toFixed(3)}, {data.y?.toFixed(3)})
          </Text>
          <Text fontSize="xs" color="gray.600">
            🎯 Cluster: {data.cluster}
          </Text>
          {data.isCentroid && (
            <Text fontSize="xs" color="red.600" fontWeight="bold">
              ⭐ Centroide del Cluster
            </Text>
          )}
        </Box>
      </Box>
    );
  }
  return null;
};

const MetricasML = () => {
  const [metrics, setMetrics] = useState<KMeansMetrics | null>(null);
  const [clusterData, setClusterData] = useState<ClusterPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "https://api.objectconnect-udg.com/ml-metrics",
      );

      if (!response.ok) {
        throw new Error("Error al obtener métricas");
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error fetching metrics:", err);
    }
  };

  const fetchClusters = async () => {
    try {
      const response = await fetch(
        "https://api.objectconnect-udg.com/ml-visualization",
      );

      if (!response.ok) {
        console.error(`Error HTTP: ${response.status} ${response.statusText}`);
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      const points = data.clusters || data.points || [];
      const centroids = data.centroids || [];

      // Procesar datos con centroides
      const processedData: ClusterPoint[] = [];

      // Agregar puntos regulares
      if (Array.isArray(points)) {
        points.forEach((point: APIPoint) => {
          processedData.push({
            x: point.x,
            y: point.y,
            cluster: point.cluster,
            titulo: point.title || "",
            descripcion: point.description || "",
            categoria: point.category || "",
            isCentroid: false,
          });
        });
      }

      // Agregar centroides
      if (Array.isArray(centroids)) {
        centroids.forEach((centroid: APICentroid, index: number) => {
          processedData.push({
            x: centroid.x,
            y: centroid.y,
            cluster: centroid.cluster ?? index,
            titulo: `Centroide ${centroid.cluster ?? index}`,
            isCentroid: true,
          });
        });
      }

      setClusterData(processedData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      console.error("Error fetching clusters:", errorMsg);
      setError(errorMsg);
    }
  };

  const refreshData = async () => {
    await Promise.all([fetchMetrics(), fetchClusters()]);
    setLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchMetrics(), fetchClusters()]);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
      <VStack align="start" spacing={6} w="full">
        {/* Header */}
        <HStack justify="space-between" w="full">
          <Heading size="lg">Métricas de Machine Learning</Heading>
          <Button colorScheme="blue" onClick={refreshData} isLoading={loading}>
            Refrescar Información
          </Button>
        </HStack>

        {/* Error Message */}
        {error && (
          <Box bg="red.100" color="red.700" p={4} borderRadius="md" w="full">
            <Text>❌ {error}</Text>
          </Box>
        )}

        {/* Loading State */}
        {loading && clusterData.length === 0 && (
          <Box display="flex" justifyContent="center" w="full" py={10}>
            <Spinner size="lg" color="blue.500" />
          </Box>
        )}

        {/* Metrics Information */}
        {metrics && (
          <Box w="full">
            <VStack align="start" spacing={4}>
              {/* Información del Modelo */}
              <Box
                bg="blue.50"
                p={4}
                borderRadius="lg"
                w="full"
                borderLeft="4px solid #4299E1"
              >
                <Heading size="sm" mb={3}>
                  🤖 Información del Modelo
                </Heading>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm">
                    <strong>Modelo SBERT:</strong> {metrics.sbert_model}
                  </Text>
                  <Text fontSize="sm">
                    <strong>Dimensión de vectores:</strong>{" "}
                    {metrics.vector_dimension}
                  </Text>
                  <Text fontSize="sm">
                    <strong>Total de vectores:</strong> {metrics.vector_count}
                  </Text>
                </VStack>
              </Box>

              {/* Configuración de Clustering */}
              <Box
                bg="purple.50"
                p={4}
                borderRadius="lg"
                w="full"
                borderLeft="4px solid #9F7AEA"
              >
                <Heading size="sm" mb={3}>
                  ⚙️ Configuración de Clustering
                </Heading>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm">
                    <strong>Número de clusters (k):</strong>{" "}
                    {metrics.k_clusters || "N/A"}
                  </Text>
                  <Text fontSize="sm">
                    <strong>Número de categorías:</strong>{" "}
                    {metrics.num_categories || "N/A"}
                  </Text>
                </VStack>
              </Box>

              {/* Métricas de Calidad */}
              <Box
                bg="green.50"
                p={4}
                borderRadius="lg"
                w="full"
                borderLeft="4px solid #48BB78"
              >
                <Heading size="sm" mb={3}>
                  📊 Métricas de Calidad del Clustering
                </Heading>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm">
                    <strong>Silhouette Score:</strong>{" "}
                    {metrics.silhouette_score?.toFixed(4)}
                    <span
                      style={{
                        fontSize: "0.75rem",
                        marginLeft: "0.5rem",
                        color: "#718096",
                      }}
                    >
                      (rango: -1 a 1, mayor es mejor)
                    </span>
                  </Text>
                  <Text fontSize="sm">
                    <strong>Davies-Bouldin Index:</strong>{" "}
                    {metrics.davies_bouldin_index?.toFixed(4) || "N/A"}
                    <span
                      style={{
                        fontSize: "0.75rem",
                        marginLeft: "0.5rem",
                        color: "#718096",
                      }}
                    >
                      (menor es mejor)
                    </span>
                  </Text>
                  <Text fontSize="sm">
                    <strong>Calinski-Harabasz Index:</strong>{" "}
                    {metrics.calinski_harabasz_index?.toFixed(4) || "N/A"}
                    <span
                      style={{
                        fontSize: "0.75rem",
                        marginLeft: "0.5rem",
                        color: "#718096",
                      }}
                    >
                      (mayor es mejor)
                    </span>
                  </Text>
                  <Text fontSize="sm">
                    <strong>Información Mutua Normalizada:</strong>{" "}
                    {metrics.normalized_mutual_info?.toFixed(4) || "N/A"}
                    <span
                      style={{
                        fontSize: "0.75rem",
                        marginLeft: "0.5rem",
                        color: "#718096",
                      }}
                    >
                      (rango: 0 a 1, mayor es mejor)
                    </span>
                  </Text>
                  <Text fontSize="sm">
                    <strong>Inercia:</strong> {metrics.inertia?.toFixed(2)}
                  </Text>
                </VStack>
              </Box>

              {/* Distribución de Clusters */}
              {metrics.cluster_distribution && (
                <Box
                  bg="orange.50"
                  p={4}
                  borderRadius="lg"
                  w="full"
                  borderLeft="4px solid #ED8936"
                >
                  <Heading size="sm" mb={3}>
                    📈 Distribución de Puntos por Cluster
                  </Heading>
                  <HStack spacing={4} flexWrap="wrap">
                    {Object.entries(metrics.cluster_distribution).map(
                      ([cluster, count]) => (
                        <Box
                          key={cluster}
                          bg="white"
                          p={2}
                          borderRadius="md"
                          textAlign="center"
                          minW="80px"
                          boxShadow="sm"
                        >
                          <Text
                            fontSize="xs"
                            fontWeight="bold"
                            color="orange.600"
                          >
                            Cluster {cluster}
                          </Text>
                          <Text fontSize="lg" fontWeight="bold">
                            {count}
                          </Text>
                        </Box>
                      ),
                    )}
                  </HStack>
                </Box>
              )}

              {/* Información de Sincronización */}
              <Box
                bg="gray.50"
                p={4}
                borderRadius="lg"
                w="full"
                borderLeft="4px solid #CBD5E0"
              >
                <Text fontSize="sm">
                  <strong>🔄 Última sincronización:</strong> {metrics.last_sync}
                </Text>
              </Box>
            </VStack>
          </Box>
        )}

        {/* KMeans Clusters Visualization */}
        {clusterData.length > 0 && (
          <Box w="full">
            <Heading size="md" mb={4}>
              Visualización de Clusters K-Means
            </Heading>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" name="Dimensión X" />
                <YAxis type="number" dataKey="y" name="Dimensión Y" />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ strokeDasharray: "3 3" }}
                />
                <Legend />

                {/* Render each cluster as a separate scatter */}
                {Array.from(
                  new Set(clusterData.map((point) => point.cluster)),
                ).map((cluster, index) => {
                  const clusterPoints = clusterData.filter(
                    (point) => point.cluster === cluster && !point.isCentroid,
                  );
                  return (
                    <Scatter
                      key={`cluster-${cluster}`}
                      name={`Cluster ${cluster}`}
                      data={clusterPoints}
                      fill={CLUSTER_COLORS[index % CLUSTER_COLORS.length]}
                    />
                  );
                })}

                {/* Render centroids separately */}
                {clusterData.filter((point) => point.isCentroid).length > 0 && (
                  <Scatter
                    name="Centroides"
                    data={clusterData.filter((point) => point.isCentroid)}
                    fill="#FF6B6B"
                  />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Empty State */}
        {!loading && clusterData.length === 0 && !error && (
          <Box bg="yellow.50" p={4} borderRadius="md" w="full">
            <Text color="yellow.800">
              ⚠️ No hay datos de clusters disponibles
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default MetricasML;
