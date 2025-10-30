import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { getUserSession, UserSession } from '../services/api/userSession';

type Props = {
  require: 'moderator' | 'booth_agent' | 'any';
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export default function PermissionGuard({ require, fallback, children }: Props) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    (async () => {
      const s = await getUserSession();
      setUser(s);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (require === 'any') return <>{children}</>;
  if (!user) return <>{fallback ?? null}</>;

  const role = (user.role || '').toString().toLowerCase();
  if (require === 'moderator' && (role === 'moderator' || role === 'admin' || role === 'aci')) return <>{children}</>;
  if (require === 'booth_agent' && (role === 'booth_agent' || role.includes('booth'))) return <>{children}</>;

  return <>{fallback ?? null}</>;
}
