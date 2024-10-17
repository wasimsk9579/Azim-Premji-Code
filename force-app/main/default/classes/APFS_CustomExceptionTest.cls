@isTest
public class APFS_CustomExceptionTest {
    
    @isTest
    public static void testAPFS_CustomException1() {
        // Call the static method
        APFS_CustomException.APFS_CustomException1();
        
        // Since the method doesn't return anything or perform any actions,
        // we're simply asserting that no exceptions are thrown.
        System.assert(true, 'APFS_CustomException1 executed successfully.');
    }
}