import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WarningOctagon, ArrowRight, Package } from '@phosphor-icons/react';
import api from '../../../utils/api';

const InventoryAlerts = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventoryAlerts = async () => {
      try {
        setLoading(true);
        // Fetch low stock items
        const lowStockResponse = await api.get('/api/inventory', {
          params: { lowStock: true },
        });

        // Fetch expiring items
        const expiringResponse = await api.get('/api/inventory', {
          params: { expiringSoon: true },
        });

        // Combine and format the alerts
        const lowStockItems = lowStockResponse.data.map((item) => ({
          ...item,
          alertType: 'lowStock',
          message: `Low stock: ${item.quantity} ${item.unit} remaining`,
        }));

        const expiringItems = expiringResponse.data.map((item) => {
          const daysUntilExpiry = Math.ceil(
            (new Date(item.expiration_date) - new Date()) /
              (1000 * 60 * 60 * 24)
          );
          return {
            ...item,
            alertType: 'expiring',
            message: `Expires in ${daysUntilExpiry} days`,
          };
        });

        // Combine all alerts
        const allAlerts = [...lowStockItems, ...expiringItems];

        // Sort by priority (expiring items first, then low stock)
        allAlerts.sort((a, b) => {
          // If both are expiring items, sort by days until expiration
          if (a.alertType === 'expiring' && b.alertType === 'expiring') {
            return new Date(a.expiration_date) - new Date(b.expiration_date);
          }
          // Expiring items come before low stock
          if (a.alertType === 'expiring') return -1;
          if (b.alertType === 'expiring') return 1;
          // Otherwise sort alphabetically by name
          return a.item_name.localeCompare(b.item_name);
        });

        setAlerts(allAlerts);
        setLoading(false);
      } catch (err) {
        setError('Failed to load inventory alerts');
        setLoading(false);
        console.error('Error fetching inventory alerts:', err);
      }
    };

    fetchInventoryAlerts();
  }, []);

  // Get alert color based on type
  const getAlertColor = (alertType, daysLeft) => {
    if (alertType === 'expiring') {
      // Red for items expiring very soon, amber for others
      return daysLeft <= 7
        ? 'bg-red-100 border-red-200'
        : 'bg-amber-100 border-amber-200';
    } else {
      // Low stock items
      return 'bg-blue-100 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 p-4 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Inventory Alerts</h3>
        </div>
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 p-4 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Inventory Alerts</h3>
        </div>
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Inventory Alerts</h3>
        <button
          onClick={() => navigate('/admin/inventory/feed')}
          className="flex items-center text-sm text-amber-600 hover:text-amber-800"
        >
          View All <ArrowRight size={16} className="ml-1" />
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-gray-500">
          <Package size={40} weight="duotone" className="mb-2" />
          <p>No inventory alerts</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.slice(0, 5).map((alert) => {
            const daysUntilExpiry = alert.expiration_date
              ? Math.ceil(
                  (new Date(alert.expiration_date) - new Date()) /
                    (1000 * 60 * 60 * 24)
                )
              : null;

            return (
              <div
                key={alert.inventory_id}
                className={`flex items-center justify-between rounded-md border p-3 ${getAlertColor(alert.alertType, daysUntilExpiry)}`}
              >
                <div className="flex items-center">
                  <WarningOctagon
                    size={20}
                    weight="duotone"
                    className={
                      alert.alertType === 'expiring' && daysUntilExpiry <= 7
                        ? 'mr-2 text-red-500'
                        : 'mr-2 text-amber-500'
                    }
                  />
                  <div>
                    <h4 className="font-medium">{alert.item_name}</h4>
                    <p className="text-xs">{alert.message}</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    navigate(`/admin/inventory/${alert.inventory_id}`)
                  }
                  className="rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  View
                </button>
              </div>
            );
          })}

          {alerts.length > 5 && (
            <div className="pt-2 text-center">
              <p className="text-sm text-gray-500">
                {alerts.length - 5} more alerts not shown
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryAlerts;
