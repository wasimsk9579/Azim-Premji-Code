/**
 * @description       : Shows available scholarships in the apfs experience site.
 * @author            : owais.ahanger@cloudodyssey.co
 * @last modified on  : 21-07-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
 * Test Class		  : APFS_ScholarshipControllerTest
**/
public without sharing class APFS_ScholarshipController {
    /**
     * @description       : Fetches and returns a list of active scholarships with their corresponding active editions and rounds.
     * @return List<Map<String, Object>> : List of maps containing scholarship details with active editions and rounds.
     * @throws APFS_CustomException : Exception thrown if there is an error in fetching the scholarships or processing the data.
     */
  @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getActiveScholarships(){
        try{
             List<Map<String, Object>> result = new List<Map<String, Object>>();
            	List<Scholarship__c> activeScholarships=[
				SELECT ID,Scholarship_Name__c,Is_Active__c,
					
                	(SELECT ID,Name,

                         (SELECT Id, Name,Is_Active_Round__c,Round_End_Date__c, Round_Type__c,Round_Number__c 
                          FROM Scholarship_Rounds__r WHERE Is_Active_Round__c=true)

                 	FROM Scholarship_Editions__r WHERE Is_Active_Edition__c=true)
				 	
                FROM Scholarship__c WHERE Is_Active__c=true];

			
            System.debug('Active Scholarships: ' + activeScholarships);

        

			     for (Scholarship__c scholarship : activeScholarships) {
                if (scholarship.Scholarship_Editions__r != null && !scholarship.Scholarship_Editions__r.isEmpty()) {
                    for (Scholarship_Edition__c edition : scholarship.Scholarship_Editions__r) {
                        if (edition.Scholarship_Rounds__r != null && !edition.Scholarship_Rounds__r.isEmpty()) {
                            for (Scholarship_Round__c round : edition.Scholarship_Rounds__r) {
                                Map<String, Object> scholarshipMap = new Map<String, Object>();
                                scholarshipMap.put('scholarshipId', scholarship.Id);
                                scholarshipMap.put('scholarshipName', scholarship.Scholarship_Name__c);
                                scholarshipMap.put('editionId', edition.Id);
                                //scholarshipMap.put('editionYear', edition.Year__c);
                                scholarshipMap.put('roundId', round.Id);
								scholarshipMap.put('roundType', round.Round_Type__c);
                                scholarshipMap.put('roundEndDate', round.Round_End_Date__c);
                                scholarshipMap.put('roundNumber', round.Round_Number__c);
                                result.add(scholarshipMap);
                            }
                        }
                    }
                }
            }

             System.debug('Active Scholarships having active editon with active round: ' + result);
             return result;
			
            
        }catch(Exception e){
         throw new APFS_CustomException(e.getMessage());
        }
        
     
}
}