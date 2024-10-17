@isTest
private class APFS_RefferalStatesandOrgTest {

    @isTest
    static void testGetReferralPartnerAccounts() {
        Account referralPartner = new Account(Name = 'Referral Partner Accounts');
        insert referralPartner;

        Id result = APFS_RefferalStatesandOrg.getReferralPartnerAccounts();

        System.assertNotEquals(null, result, 'The account ID should not be null');
        System.assertEquals(referralPartner.Id, result, 'The returned account ID should match the inserted account ID');
    }
    
    

    @isTest
    static void testGetStateChildAccounts() {
        Account referralPartner = new Account(Name = 'Referral Partner Accounts');
        insert referralPartner;

        Account stateAccount = new Account(
            Name = 'State Account',
            ParentId = referralPartner.Id,
            Referral_Partner_State_Value__c = 'California'
        );
        insert stateAccount;

        List<Id> parentAccountIds = new List<Id>{ referralPartner.Id };
        List<Account> stateChildAccounts = APFS_RefferalStatesandOrg.getStateChildAccounts(parentAccountIds);

        System.assertEquals(1, stateChildAccounts.size(), 'There should be one state child account');
        System.assertEquals(stateAccount.Id, stateChildAccounts[0].Id, 'The returned state account ID should match the inserted account ID');
    }
    
    
     @isTest
    static void testGetInstituteChildAccounts() {
        Account parentAccount = new Account(Name = 'Parent Account');
        insert parentAccount;
        
        Account childAccount1 = new Account(Name = 'Child Account 1', ParentId = parentAccount.Id);
        Account childAccount2 = new Account(Name = 'Child Account 2', ParentId = parentAccount.Id);
        insert new List<Account>{childAccount1, childAccount2};
        List<Account> childAccounts = APFS_RefferalStatesandOrg.getInstituteChildAccounts(new List<Id>{parentAccount.Id});
        System.assertEquals(2, childAccounts.size(), 'There should be 2 child accounts');
        System.assert(childAccounts.contains(childAccount1), 'The result should contain childAccount1');
        System.assert(childAccounts.contains(childAccount2), 'The result should contain childAccount2');
    }

    @isTest
    static void testGetInstituteValues() {
        Account parentAccount = new Account(Name = 'Name Of Institutes In India');
        insert parentAccount;
        Account childAccount1 = new Account(Name = 'Child Account 1', ParentId = parentAccount.Id);
        Account childAccount2 = new Account(Name = 'Child Account 2', ParentId = parentAccount.Id);
        insert new List<Account>{childAccount1, childAccount2};
        Map<Id, String> instituteValues = APFS_RefferalStatesandOrg.getInstituteValues();
        System.assertEquals(2, instituteValues.size(), 'There should be 2 institute values');
        System.assertEquals('Child Account 1', instituteValues.get(childAccount1.Id), 'The map should contain childAccount1 with correct name');
        System.assertEquals('Child Account 2', instituteValues.get(childAccount2.Id), 'The map should contain childAccount2 with correct name');
    }

    
     @isTest
    static void testGetInstituteAccounts() {
        Account testAccount = new Account(Name = 'Name Of Institutes In India');
        insert testAccount;
        
    
        Id accountId = APFS_RefferalStatesandOrg.getInstituteAccounts();
        
      
        System.assertNotEquals(null, accountId, 'The accountId should not be null');
        System.assertEquals(testAccount.Id, accountId, 'The accountId should match the inserted test account');
    }

    @isTest
    static void testGetOrganizationAccounts() {
        Account referralPartner = new Account(Name = 'Referral Partner Accounts');
        insert referralPartner;
        Account stateAccount = new Account(
            Name = 'State Account',
            ParentId = referralPartner.Id,
            Referral_Partner_State_Value__c = 'California'
        );
        insert stateAccount;
        Account organizationAccount = new Account(
            Name = 'Organization Account',
            ParentId = stateAccount.Id
        );
        insert organizationAccount;
        List<Id> stateAccountIds = new List<Id>{ stateAccount.Id };
        List<Account> organizationAccounts = APFS_RefferalStatesandOrg.getOrganizationAccounts(stateAccountIds);
        System.assertEquals(1, organizationAccounts.size(), 'There should be one organization account');
        System.assertEquals(organizationAccount.Id, organizationAccounts[0].Id, 'The returned organization account ID should match the inserted account ID');
    }

    @isTest
    static void testGetStatePicklistValues() {
        Account referralPartner = new Account(Name = 'Referral Partner Accounts');
        insert referralPartner;

        Account stateAccount = new Account(
            Name = 'State Account',
            ParentId = referralPartner.Id,
            Referral_Partner_State_Value__c = 'California'
        );
        insert stateAccount;
        Map<Id, String> statePicklistValues = APFS_RefferalStatesandOrg.getStatePicklistValues();
        System.assertEquals(1, statePicklistValues.size(), 'There should be one state picklist value');
        System.assertEquals('California', statePicklistValues.get(stateAccount.Id), 'The state picklist value should match the inserted state value');
    }

    @isTest
    static void testGetOrganizationPicklistValues() {
        Account referralPartner = new Account(Name = 'Referral Partner Accounts');
        insert referralPartner;

        Account stateAccount = new Account(
            Name = 'State Account',
            ParentId = referralPartner.Id,
            Referral_Partner_State_Value__c = 'California'
        );
        insert stateAccount;

        Account organizationAccount = new Account(
            Name = 'Organization Account',
            ParentId = stateAccount.Id
        );
        insert organizationAccount;
        Map<Id, String> organizationPicklistValues = APFS_RefferalStatesandOrg.getOrganizationPicklistValues(stateAccount.Id);
        System.assertEquals(1, organizationPicklistValues.size(), 'There should be one organization picklist value');
        System.assertEquals('Organization Account', organizationPicklistValues.get(organizationAccount.Id), 'The organization picklist value should match the inserted organization name');
    }
}