const LOCAL_HISTORY_KEY = "gym_history_v1";
const USER_LIST_KEY = "gym_user_list";
const CUSTOM_ROUTINES_KEY = "gym_custom_routines_v1";
const FAVORITES_KEY_PREFIX = "gym_favorites_v1_";

function getSafeStorage() {
  try {
    const testKey = "__gym_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (err) {
    const memory = new Map();
    return {
      getItem: key => (memory.has(key) ? memory.get(key) : null),
      setItem: (key, value) => {
        memory.set(key, String(value));
      },
      removeItem: key => {
        memory.delete(key);
      },
      key: index => Array.from(memory.keys())[index] ?? null,
      get length() {
        return memory.size;
      }
    };
  }
}

const storage = getSafeStorage();

function safeParseJSON(raw, fallback = null) {
  if (raw == null || raw === "") return fallback;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return fallback;
  }
}

function readStorageJSON(key, fallback = null) {
  return safeParseJSON(storage.getItem(key), fallback);
}

function writeStorageJSON(key, value) {
  storage.setItem(key, JSON.stringify(value));
}

function normalizeUserName(name) {
  return name.trim().replace(/\s+/g, "_");
}

function loadUserList() {
  let list = [];
  let changed = false;
  const parsed = readStorageJSON(USER_LIST_KEY, []);
  if (Array.isArray(parsed)) {
    if (parsed.length && typeof parsed[0] === "string") {
      list = parsed
        .filter(item => typeof item === "string" && item.trim())
        .map(item => ({ name: item.trim(), key: normalizeUserName(item.trim()) }));
    } else {
      list = parsed.filter(item => item && typeof item.name === "string" && typeof item.key === "string");
    }
  }

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i) || "";
    const prefix = `${LOCAL_HISTORY_KEY}_`;
    if (!key.startsWith(prefix)) continue;
    const userKey = key.slice(prefix.length);
    if (!userKey) continue;
    const exists = list.some(item => item.key === userKey);
    if (!exists) {
      list.push({ name: userKey.replace(/_/g, " "), key: userKey });
      changed = true;
    }
  }

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i) || "";
    const match = key.match(/^gym_(.*?)_\d{4}-\d{2}-\d{2}_/);
    if (!match) continue;
    const userKey = match[1];
    if (!userKey) continue;
    const exists = list.some(item => item.key === userKey);
    if (!exists) {
      list.push({ name: userKey.replace(/_/g, " "), key: userKey });
      changed = true;
    }
  }

  const lastUser = storage.getItem("gym_user_name") || "";
  if (lastUser.trim()) {
    const lastKey = normalizeUserName(lastUser.trim());
    const exists = list.some(item => item.key === lastKey);
    if (!exists) {
      list.push({ name: lastUser.trim(), key: lastKey });
      changed = true;
    }
  }

  if (changed) {
    writeStorageJSON(USER_LIST_KEY, list);
  }

  return list;
}

function saveUserList(list) {
  writeStorageJSON(USER_LIST_KEY, list);
}

function getFavoritesKey(userKey = currentUserKey) {
  if (!userKey) return "";
  return `${FAVORITES_KEY_PREFIX}${userKey}`;
}

function loadFavorites(userKey = currentUserKey) {
  const key = getFavoritesKey(userKey);
  if (!key) return [];
  const parsed = readStorageJSON(key, []);
  if (!Array.isArray(parsed)) return [];
  const cleaned = parsed
    .filter(item => typeof item === "string" && item.trim())
    .map(item => item.trim());
  return Array.from(new Set(cleaned));
}

function saveFavorites(list, userKey = currentUserKey) {
  const key = getFavoritesKey(userKey);
  if (!key) return;
  const cleaned = Array.from(new Set((list || []).filter(Boolean).map(item => String(item).trim()).filter(Boolean)));
  writeStorageJSON(key, cleaned);
}
