import { UserSession, getUserSession } from '../services/api/userSession';

export const isModerator = (user?: UserSession | null) => {
  if (!user) return false;
  const role = (user.role || '').toString().toLowerCase();
  return role === 'moderator' || role === 'admin' || role === 'aci';
};

export const isBoothAgent = (user?: UserSession | null) => {
  if (!user) return false;
  const role = (user.role || '').toString().toLowerCase();
  return role === 'booth_agent' || role.includes('booth');
};

export const canCreateBooth = (user?: UserSession | null) => {
  return isModerator(user);
};

export const canManageBooth = (user?: UserSession | null) => {
  return isModerator(user);
};

export const canEditVoter = (user?: UserSession | null, voterBoothId?: string) => {
  if (!user) return false;
  if (isModerator(user)) return true;
  if (isBoothAgent(user) && voterBoothId) {
    return !!user.assignedBooths?.includes(voterBoothId);
  }
  return false;
};

// Async helper to quickly check current saved session
export const currentUserIsModerator = async () => {
  const s = await getUserSession();
  return isModerator(s);
};

export default {
  isModerator,
  isBoothAgent,
  canCreateBooth,
  canManageBooth,
  canEditVoter,
  currentUserIsModerator,
};
