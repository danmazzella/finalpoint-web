# Environment Separation for Chat System

## Overview

This guide explains how to keep development and production chat data completely separate in Firestore, preventing test messages from mixing with real user data.

## Implementation

### **Collection Naming Strategy**

The chat system now uses environment-prefixed collection names:

- **Development**: `dev_chat_messages`, `dev_chat_users`, etc.
- **Production**: `prod_chat_messages`, `prod_chat_users`, etc.

### **How It Works**

#### **Web App (Next.js)**
```typescript
// Automatically detects environment
const getCollectionName = (baseName: string) => {
    const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
    return `${env}_${baseName}`;
};
```

#### **Mobile App (React Native)**
```typescript
// Uses __DEV__ flag to detect development mode
const getCollectionName = (baseName: string) => {
    const env = __DEV__ ? 'dev' : 'prod';
    return `${env}_${baseName}`;
};
```

## Data Structure

### **Development Collections**
```
dev_chat_messages/
├── {messageId}/
│   ├── text: "Test message"
│   ├── user: { _id: "123", name: "Test User" }
│   ├── leagueId: "123"
│   └── createdAt: timestamp

dev_chat_users/
├── {userId}/
│   ├── name: "Test User"
│   ├── email: "test@example.com"
│   └── leagues: ["123"]

dev_league_members/
├── {userId}_{leagueId}/
│   ├── userId: "123"
│   ├── leagueId: "123"
│   └── joinedAt: timestamp
```

### **Production Collections**
```
prod_chat_messages/
├── {messageId}/
│   ├── text: "Real user message"
│   ├── user: { _id: "456", name: "Real User" }
│   ├── leagueId: "789"
│   └── createdAt: timestamp

prod_chat_users/
├── {userId}/
│   ├── name: "Real User"
│   ├── email: "user@example.com"
│   └── leagues: ["789"]

prod_league_members/
├── {userId}_{leagueId}/
│   ├── userId: "456"
│   ├── leagueId: "789"
│   └── joinedAt: timestamp
```

## Benefits

### **1. Complete Data Isolation**
- ✅ Development messages never appear in production
- ✅ Production data is never affected by testing
- ✅ Easy to clean up test data

### **2. Safe Testing**
- ✅ Test with real data structures
- ✅ No risk of corrupting production data
- ✅ Multiple developers can test simultaneously

### **3. Easy Data Management**
- ✅ Clear separation in Firebase Console
- ✅ Easy to delete all dev data when needed
- ✅ Production data remains untouched

## Security Rules

The Firestore security rules handle both environments:

```javascript
// Helper function checks both dev and prod collections
function isLeagueMember(leagueId) {
  return exists(/databases/$(database)/documents/dev_league_members/$(request.auth.uid + '_' + leagueId)) ||
         exists(/databases/$(database)/documents/prod_league_members/$(request.auth.uid + '_' + leagueId));
}
```

## Deployment

### **Development**
- Uses `dev_*` collections
- Test data is isolated
- Safe for experimentation

### **Production**
- Uses `prod_*` collections
- Real user data
- Production-ready security

## Data Migration

### **From Legacy Collections**
If you have existing data in the old collection names (`chat_messages`, etc.), the system includes backward compatibility:

1. **Legacy collections** are still supported
2. **New data** automatically uses environment prefixes
3. **Migration script** can be created if needed

### **Migration Script Example**
```javascript
// Run this once to migrate existing data
const migrateToEnvironmentCollections = async () => {
  const batch = db.batch();
  
  // Get all legacy messages
  const legacyMessages = await getDocs(collection(db, 'chat_messages'));
  
  legacyMessages.forEach((doc) => {
    const data = doc.data();
    const newRef = doc(collection(db, 'prod_chat_messages'), doc.id);
    batch.set(newRef, data);
  });
  
  await batch.commit();
};
```

## Testing

### **Development Testing**
1. **Create test data** in `dev_*` collections
2. **Test chat functionality** with isolated data
3. **Verify** no production data is affected

### **Production Testing**
1. **Deploy to staging** with `prod_*` collections
2. **Test with real data** structure
3. **Verify** security rules work correctly

## Monitoring

### **Firebase Console**
- **Development data**: Look for `dev_*` collections
- **Production data**: Look for `prod_*` collections
- **Legacy data**: Look for unprefixed collections

### **Usage Tracking**
```javascript
// Track which environment is being used
console.log('Using collections:', {
  messages: COLLECTIONS.MESSAGES,
  users: COLLECTIONS.USERS,
  environment: process.env.NODE_ENV
});
```

## Best Practices

### **1. Environment Detection**
- ✅ Always use environment variables or `__DEV__` flag
- ✅ Never hardcode collection names
- ✅ Test both environments

### **2. Data Cleanup**
- ✅ Regularly clean up dev data
- ✅ Monitor storage usage
- ✅ Set up automated cleanup scripts

### **3. Security**
- ✅ Test security rules in both environments
- ✅ Verify user isolation
- ✅ Monitor access patterns

## Troubleshooting

### **Common Issues**

1. **Wrong Environment Data**
   - Check `NODE_ENV` or `__DEV__` flag
   - Verify collection names in console logs
   - Ensure environment variables are set

2. **Permission Errors**
   - Check security rules for both environments
   - Verify user authentication
   - Test with both dev and prod collections

3. **Data Not Appearing**
   - Check collection name prefix
   - Verify environment detection
   - Check Firebase Console for data

### **Debug Mode**
```javascript
// Add to your chat service for debugging
console.log('Environment:', process.env.NODE_ENV);
console.log('Collections:', COLLECTIONS);
console.log('User ID:', user?.id);
```

## Cost Considerations

### **Storage**
- **Development**: Minimal cost (test data only)
- **Production**: Normal usage costs
- **Legacy**: Temporary (until migration complete)

### **Reads/Writes**
- **Development**: Low volume (testing only)
- **Production**: Normal user volume
- **Separation**: No additional cost overhead

This environment separation ensures your chat system is production-ready while maintaining safe development practices! 🚀
