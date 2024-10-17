@isTest
public class APFS_AppStatusSubmittedToReviewScheTest {
    @isTest
    static void testExecuteMethod() {
        // Create test data required for the batch class to run
        List<Account> testAccounts = new List<Account>();
        for (Integer i = 0; i < 50; i++) {
            testAccounts.add(new Account(Name = 'Test Account ' + i));
        }
        insert testAccounts;
        
        // Mocking the schedulable context
        Test.startTest();
        
        // Scheduling the class
        APFS_AppStatusSubmittedToReviewSchedule schedulableJob = new APFS_AppStatusSubmittedToReviewSchedule();
        String jobId = System.schedule('Test Job', '0 0 0 1 * ?', schedulableJob);
        
        // Simulate the execution of the scheduled job
        schedulableJob.execute(null);
        
        // Verifying the scheduled job was successfully added
        CronTrigger cronTrigger = [SELECT Id, CronJobDetail.Name, State FROM CronTrigger WHERE Id = :jobId];
        System.assertEquals('Test Job', cronTrigger.CronJobDetail.Name);
        System.assertEquals('WAITING', cronTrigger.State); // State would be 'WAITING' because we just scheduled the job.
        
        // Stop the test to execute the batch class
        Test.stopTest();
    }
}