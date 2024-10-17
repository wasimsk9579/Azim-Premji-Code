/**
 * @description       : Utility class for retrieving and managing state, district, block, and institution data.
 *                      This class provides methods to fetch hierarchical account information and other related 
 *                      data based on various criteria such as state, district, and block. It includes methods to 
 *                      get picklist values, fetch specific records, and perform searches.
 * @author            : gurumohan.kollu@cloudodyssey.co
 * @last modified on  : 02-08-2024
 * @last modified by  : girish.kumar@cloudodyssey.co
 * Test Class		  : APFS_StateDistrictUtilityTest
**/
public without sharing class APFS_StateDistrictUtilityController {
    private static final String CountryGeoLocationName = 'India Geo Locations';
    /**
     * @description Retrieves the ID of the 'Schools India' account, which is used as the root for hierarchical account queries.
     * @return Id The ID of the 'Schools India' account.
     * @throws APFS_CustomException If the account cannot be found.
     */
    // Method to retrieve the ID of the 'Schools India' account
    public static Id getIndia() {        
        // Query to get accounts where the name is 'Schools India'
        Id accountId = [SELECT Id FROM Account WHERE Name = :CountryGeoLocationName LIMIT 1].Id;        
        return accountId;
    }

    // Method to retrieve state child accounts of the given Schools India
    public static List<Account> getStateChildAccounts(List<Id> parentAccountIds) { 
        try {
            if (parentAccountIds.isEmpty()) {
                throw new APFS_CustomException('No parent account IDs provided.');
            }

            List<Account> stateChildAccounts = [
                SELECT Id, Name, ParentId 
                FROM Account 
                WHERE ParentId IN :parentAccountIds 
                  AND Account_Type__c = 'State'
            ];

            return stateChildAccounts;
        } catch (Exception e) {
            throw new APFS_CustomException('Failed to fetch states: ' + e.getMessage());
        }
    }

    // Method to retrieve district accounts related to state accounts
    public static List<Account> getDistrictAccounts(List<Id> stateAccountIds) {
        try {
            if (stateAccountIds.isEmpty()) {
                throw new APFS_CustomException('No state account IDs provided.');
            }

            List<Account> districtAccounts = [
                SELECT Id, Name, ParentId 
                FROM Account 
                WHERE ParentId IN :stateAccountIds 
                  AND Account_Type__c = 'District'
            ];

            return districtAccounts;
        } catch (Exception e) {
            throw new APFS_CustomException('Failed to fetch districts: ' + e.getMessage());
        }
    }
    
    // Method to retrieve block accounts
    public static List<Account> getBlockAccounts(List<Id> districtAccountIds) {
        try {
            if (districtAccountIds.isEmpty()) {
                throw new APFS_CustomException('No district account IDs provided.');
            }

            List<Account> blockAccounts = [
                SELECT Id, Name, ParentId 
                FROM Account 
                WHERE ParentId IN :districtAccountIds 
                  AND Account_Type__c = 'Block'
            ];
           system.debug('blockAccounts'+ blockAccounts);
            return blockAccounts;
        } catch (Exception e) {
            throw new APFS_CustomException('Failed to fetch blocks: ' + e.getMessage());
        }
    }
    
    // Method to get picklist values for states
    @AuraEnabled(cacheable=true)
    public static Map<Id, String> getStatePicklistValues() {
        try {
            Id referralPartnerAccountId = getIndia();
            List<Id> referralPartnerAccountIds = new List<Id>{ referralPartnerAccountId };

            List<Account> stateAccounts = getStateChildAccounts(referralPartnerAccountIds);

            Map<Id, String> statePicklistValues = new Map<Id, String>();
            for (Account state : stateAccounts) {
                statePicklistValues.put(state.Id, state.Name);
            }

            return statePicklistValues;
        } catch (Exception e) {
            throw new APFS_CustomException('Failed to fetch state picklist values: ' + e.getMessage());
        }
    }
    // Method to fetch sepecific states for education details
    @AuraEnabled(cacheable=true)
    public static Map<Id, String> fetchSpecificStates() {
        try {
            // Fetch the referral partner account ID (assumed to be for India or relevant parent)
            Id referralPartnerAccountId = getIndia();
            if (referralPartnerAccountId == null) {
                throw new APFS_CustomException('Referral partner account ID is null.');
            }

            List<Id> referralPartnerAccountIds = new List<Id>{ referralPartnerAccountId };
                
            // Fetch state child accounts where ParentId is in the list and Name is in specificStateNames
            List<Account> stateAccounts = [
                SELECT Id, Name, ParentId
                FROM Account
                WHERE ParentId IN :referralPartnerAccountIds
                  AND Account_Type__c = 'State'
                  AND Is_Participating_State__c = true
            ];

            // Build map of state ID and name
            Map<Id, String> statePicklistValues = new Map<Id, String>();
            for (Account state : stateAccounts) {
                statePicklistValues.put(state.Id, state.Name);
            }

            return statePicklistValues;
        } catch (Exception e) {
            // Wrap and throw a custom exception for better error handling
            throw new APFS_CustomException('Failed to fetch specific state picklist values: ' + e.getMessage());
        }
    }
    //Method to fetch specific districts for Education Details
	@AuraEnabled
    public static Map<Id, String> getSpecificDistrictPicklistValues(Id stateId) {
        try {
            if (stateId == null) {
                throw new APFS_CustomException('State ID cannot be null.');
            }

            List<Id> stateAccountIds = new List<Id>{ stateId };
            List<Account> districtAccounts = [
                SELECT Id, Name, ParentId
                FROM Account
                WHERE ParentId IN :stateAccountIds
                  AND Account_Type__c = 'District'
                  AND Is_Participating_District__c = true
            ];

            Map<Id, String> districtPicklistValues = new Map<Id, String>();
            for (Account district : districtAccounts) {
                districtPicklistValues.put(district.Id, district.Name);
            }

            return districtPicklistValues;
        } catch (Exception e) {
            throw new APFS_CustomException('Failed to fetch district picklist values: ' + e.getMessage());
        }
    }
    // Method to get picklist values for districts
    @AuraEnabled
    public static Map<Id, String> getDistrictPicklistValues(Id stateId) {
        try {
            if (stateId == null) {
                throw new APFS_CustomException('State ID cannot be null.');
            }

            List<Id> stateAccountIds = new List<Id>{ stateId };
            List<Account> districtAccounts = getDistrictAccounts(stateAccountIds);

            Map<Id, String> districtPicklistValues = new Map<Id, String>();
            for (Account district : districtAccounts) {
                districtPicklistValues.put(district.Id, district.Name);
            }

            return districtPicklistValues;
        } catch (Exception e) {
            throw new APFS_CustomException('Failed to fetch district picklist values: ' + e.getMessage());
        }
    }
    
    // Method to get picklist values for blocks based on district ID
    @AuraEnabled
    public static Map<Id, String> getBlockPicklistValues(Id districtId) {
        try {
            if (districtId == null) {
                throw new APFS_CustomException('District ID cannot be null.');
            }

            List<Id> districtAccountIds = new List<Id>{ districtId };
            List<Account> blockAccounts = getBlockAccounts(districtAccountIds);

            Map<Id, String> blockPicklistValues = new Map<Id, String>();
            for (Account block : blockAccounts) {
                blockPicklistValues.put(block.Id, block.Name);
            }

            return blockPicklistValues;
        } catch (Exception e) {
            throw new APFS_CustomException('Failed to fetch block picklist values: ' + e.getMessage());
        }
    }

    // Method to get institutes based on district ID and search key
   @AuraEnabled
   public static List<Institute__c> getInstitutesBySearch(String state, String district, String searchKey) {
    try {
        if (String.isBlank(state)) {
            throw new APFS_CustomException('State cannot be null or empty.');
        }
        if (String.isBlank(district)) {
            throw new APFS_CustomException('District cannot be null or empty.');
        }
        if (String.isBlank(searchKey)) {
            throw new APFS_CustomException('Search Key cannot be null or empty.');
        }
        
        String searchFilter = '%' + searchKey + '%';
        List<Institute__c> instituteAccounts = [
            SELECT Id,Institute_Name__c 
            FROM Institute__c 
            WHERE Institute_State__c = :state 
              AND Institute_District__c = :district 
              AND Institute_Name__c LIKE :searchFilter
        ];
        return instituteAccounts;
    } catch (Exception e) {
        throw new APFS_CustomException('Failed to fetch institutes: ' + e.getMessage());
    }
}


    // Method to get schools based on block ID and search key
    @AuraEnabled
    public static List<School__c> getSchoolBySearch(String state, String district, String block, String searchKey) {
        try {
            if (String.isBlank(state)) {
            throw new APFS_CustomException('State cannot be null or empty.');
            }
            if (String.isBlank(district)) {
                throw new APFS_CustomException('District cannot be null or empty.');
            }
            if (String.isBlank(block)) {
                throw new APFS_CustomException('Block cannot be null or empty.');
            }
            if (String.isBlank(searchKey)) {
                throw new APFS_CustomException('Search Key cannot be null or empty.');
            }
           String searchFilter = '%' + searchKey + '%';
            List<School__c> schoolRecords = [SELECT Id,School_Name__c FROM School__c 
                                               WHERE School_State__c = :state 
                                               AND School_District__c = :district 
                                               AND School_Block__c = :block
                                               AND School_Name__c LIKE :searchFilter];

            return schoolRecords;
        } catch (Exception e) {
            throw new APFS_CustomException('Failed to fetch schools: ' + e.getMessage());
        }
    }
     /**
     * @description Fetches schools based on state, district, block, and class name.
     * @param state The state to filter schools by.
     * @param district The district to filter schools by.
     * @param block The block to filter schools by.
     * @param className The class name to filter schools by (e.g., '8', '10', '12').
     * @return List<School__c> A list of School__c records matching the criteria.
     * @throws APFS_CustomException If any parameter is null or empty, or if an error occurs while fetching the records.
     */
    @AuraEnabled
    public static List<School__c> getSchoolsOrBoard(String state, String district, String block, String className) {
        try {
            if (String.isBlank(state)) {
                throw new APFS_CustomException('State cannot be null or empty.');
            }
            if (String.isBlank(district)) {
                throw new APFS_CustomException('District cannot be null or empty.');
            }
            if (String.isBlank(block)) {
                throw new APFS_CustomException('Block cannot be null or empty.');
            }
            String query = 'SELECT Id, School_Name__c FROM School__c WHERE School_State__c = :state AND School_District__c = :district AND School_Block__c = :block';

            // Add condition based on classname
            if (className == '8') {
                query += ' AND Is_Eight__c = TRUE';
            } else if (className == '10') {
                query += ' AND Is_Ten__c = TRUE';
            } else if (className == '12') {
                query += ' AND Is_Twelve__c = TRUE';
            }
            List<School__c> schoolRecords = Database.query(query);
            return schoolRecords;
        }catch (Exception e) {
            throw new APFS_CustomException('Failed to fetch schools: ' + e.getMessage());
        } 
    }
}