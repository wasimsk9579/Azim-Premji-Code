/**
 * @description       : State and Partner Picklist Values For Referral Details. 
 * @author            : gurumohan.kollu@cloudodyssey.co
 * @last modified on  : 02-08-2024
 * @last modified by  : gurumohan.kollu@cloudodyssey.co
 * Test Class		  : APFS_RefferalStatesandOrgTest
**/
public class APFS_RefferalStatesandOrg {
       private static final String ReferralName ='Referral Partner Accounts';
    public static Id getReferralPartnerAccounts() {
        try {
            Id accountId = [SELECT Id FROM Account WHERE Name =:ReferralName].Id;        
            return accountId;
        } catch (Exception e) {throw new APFS_CustomException('Referral accounts not Found : ' + e.getMessage());
        }
    }
    public static List<Account> getStateChildAccounts(List<Id> parentAccountIds) {
        try {
            if (parentAccountIds.isEmpty()) {
                return new List<Account>();
            }
            List<Account> stateChildAccounts = [SELECT Id, Name, ParentId, Referral_Partner_State_Value__c 
                                                FROM Account WHERE ParentId IN :parentAccountIds];
            return stateChildAccounts;
        } catch (Exception e) { throw new APFS_CustomException('Failed to fetch states: ' + e.getMessage());
        }
    }

    public static List<Account> getOrganizationAccounts(List<Id> stateAccountIds) {
        try {
            if (stateAccountIds.isEmpty()) {
                return new List<Account>();
            }
            List<Account> organizationAccounts = [SELECT Id, Name, ParentId 
                                                  FROM Account WHERE ParentId IN :stateAccountIds];
            return organizationAccounts;
        } catch (Exception e) {throw new APFS_CustomException('Failed to fetch partner names: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Map<Id, String> getStatePicklistValues() {
        try {
            Id referralPartnerAccountId = getReferralPartnerAccounts();
            List<Id> referralPartnerAccountIds = new List<Id>{ referralPartnerAccountId };
            List<Account> stateAccounts = getStateChildAccounts(referralPartnerAccountIds);
            
            Map<Id, String> statePicklistValues = new Map<Id, String>();
            for (Account state : stateAccounts) {
                statePicklistValues.put(state.Id, state.Referral_Partner_State_Value__c);
            }
            return statePicklistValues;
        } catch (Exception e) {throw new APFS_CustomException('Failed to fetch state values: ' + e.getMessage());
        }
    }
    
     @AuraEnabled
    public static Map<Id, String> getOrganizationPicklistValues(Id stateId) {
        try {
            List<Id> stateAccountIds = new List<Id>{ stateId };
            List<Account> organizationAccounts = getOrganizationAccounts(stateAccountIds);
            
            Map<Id, String> organizationPicklistValues = new Map<Id, String>();
            for (Account organization : organizationAccounts) {
                organizationPicklistValues.put(organization.Id, organization.Name);
            }
            return organizationPicklistValues;
        } catch (Exception e) {throw new APFS_CustomException('Failed to fetch Referral Name values: ' + e.getMessage());
        }
    }


    public static Id getInstituteAccounts() {
       Id accountId  = [SELECT Id FROM Account WHERE Name = 'Name Of Institutes In India'].Id;
        return accountId;
    }
    public static List<Account> getInstituteChildAccounts(List<Id> parentAccountIds) {
        if (parentAccountIds.isEmpty()) {
            return new List<Account>();
        }
        List<Account> instituteChildAccounts = [SELECT Id, Name, ParentId, Referral_Partner_State_Value__c 
           											 FROM Account WHERE ParentId IN :parentAccountIds];
        return instituteChildAccounts;
    }

    @AuraEnabled(cacheable=true)
    public static Map<Id, String> getInstituteValues() {
        Id instituteAccountId = getInstituteAccounts();
        List<Id> instituteAccountIds = new List<Id>();        
        instituteAccountIds.add(instituteAccountId);       
        List<Account> instituteNameAccounts = getInstituteChildAccounts(instituteAccountIds);        
        Map<Id, String> instituteNameValues = new Map<Id, String>();
        for (Account institute : instituteNameAccounts) {
            instituteNameValues.put(institute.Id, institute.Name);
        }
        return instituteNameValues;
    }
}