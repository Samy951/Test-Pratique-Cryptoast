"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface CryptoData {
  rank: number;
  name: string;
  value: string;
  image: string;
  change: string;
}

const FALLBACK_DATA: CryptoData[] = [
  {
    rank: 1,
    name: "Bitcoin",
    value: "79787 €",
    image: "/btc.png",
    change: "+2.1%",
  },
  {
    rank: 2,
    name: "Ethereum",
    value: "3103 €",
    image: "/eth.png",
    change: "+1.8%",
  },
  {
    rank: 3,
    name: "BNB",
    value: "596 €",
    image: "/bnb.png",
    change: "+0.5%",
  },
];

const PodiumComponent = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const symbols = ["BTCEUR", "ETHEUR", "BNBEUR"];
        const responses = await Promise.all(
          symbols.map((symbol) =>
            fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
          )
        );

        const data = await Promise.all(
          responses.map((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
        );

        const cryptos = [
          {
            name: "Bitcoin",
            value: parseFloat(data[0].lastPrice),
            image: "/btc.png",
            change: `${parseFloat(data[0].priceChangePercent).toFixed(1)}%`,
          },
          {
            name: "Ethereum",
            value: parseFloat(data[1].lastPrice),
            image: "/eth.png",
            change: `${parseFloat(data[1].priceChangePercent).toFixed(1)}%`,
          },
          {
            name: "BNB",
            value: parseFloat(data[2].lastPrice),
            image: "/bnb.png",
            change: `${parseFloat(data[2].priceChangePercent).toFixed(1)}%`,
          },
        ];

        const formattedData: CryptoData[] = cryptos
          .sort((a, b) => b.value - a.value)
          .map((crypto, index) => ({
            ...crypto,
            rank: index + 1,
            value: `${Math.round(crypto.value).toLocaleString()} €`,
          }));

        setCryptoData(formattedData);
        setLastUpdate(new Date());
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError(
          "Impossible de charger les données. Veuillez réessayer plus tard."
        );
        setCryptoData(FALLBACK_DATA);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const renderChangeIndicator = (change: string) => {
    const isPositive = !change.startsWith("-");
    const percentage = Math.abs(parseFloat(change));

    return (
      <div className="w-100">
        <div
          className="progress"
          style={{ height: "4px", backgroundColor: "rgba(200, 200, 200, 0.1)" }}
        >
          <div
            className={`progress-bar ${
              isPositive ? "bg-success" : "bg-danger"
            }`}
            style={{
              width: `${Math.min(percentage * 10, 100)}%`,
              transition: "width 0.5s ease-in-out",
            }}
          />
        </div>
        <div
          className={`d-flex align-items-center justify-content-center mt-2 ${
            isPositive ? "text-success" : "text-danger"
          }`}
        >
          {isPositive ? (
            <TrendingUp size={14} className="me-1" />
          ) : (
            <TrendingDown size={14} className="me-1" />
          )}
          <span className="small">{change}</span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-vh-100 bg-black d-flex align-items-center justify-content-center">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  const getPositionStyles = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          order: 2,
          transform: "translateY(0)",
          zIndex: 3,
        };
      case 2:
        return {
          order: 1,
          transform: "translateY(40px)",
          zIndex: 2,
        };
      case 3:
        return {
          order: 3,
          transform: "translateY(80px)",
          zIndex: 1,
        };
      default:
        return {};
    }
  };

  return (
    <div className="min-vh-100 bg-black py-4">
      <div className="container">
        {error && (
          <div
            className="alert alert-warning d-flex align-items-center mb-4"
            role="alert"
          >
            <AlertTriangle className="me-2" />
            <div>{error}</div>
          </div>
        )}

        <div className="d-flex flex-column align-items-center">
          <div className="d-flex justify-content-center align-items-start pt-5">
            <div className="d-flex gap-4" style={{ width: "fit-content" }}>
              {cryptoData.map((crypto) => {
                const positionStyles = getPositionStyles(crypto.rank);

                return (
                  <div
                    key={crypto.rank}
                    className="position-relative"
                    style={{
                      width: "300px",
                      ...positionStyles,
                      transition: "all 0.3s ease-out",
                    }}
                  >
                    <div
                      className={`card border-0 shadow-lg ${
                        crypto.rank === 1
                          ? "border border-2 border-warning"
                          : ""
                      }`}
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <div className="position-absolute top-0 end-0 m-2">
                        <span
                          className={`badge rounded-pill ${
                            crypto.rank === 1
                              ? "bg-warning"
                              : crypto.rank === 2
                              ? "bg-secondary"
                              : "bg-danger"
                          }`}
                        >
                          #{crypto.rank}
                        </span>
                      </div>

                      <div className="card-body p-4">
                        <div className="text-center">
                          <div
                            className="position-relative mx-auto mb-3"
                            style={{ width: "64px", height: "64px" }}
                          >
                            <Image
                              src={crypto.image}
                              alt={crypto.name}
                              fill
                              className="object-fit-contain"
                              priority
                            />
                          </div>

                          <h3 className="h5 mb-2">{crypto.name}</h3>
                          <p className="h4 fw-bold mb-3">{crypto.value}</p>
                          {renderChangeIndicator(crypto.change)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {lastUpdate && (
            <div className="text-light opacity-75 small mt-5 pt-5">
              Dernière mise à jour : {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PodiumComponent;
