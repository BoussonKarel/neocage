using Microsoft.Azure.Cosmos.Table;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace NCFunctions.Helpers
{
    public static class StorageHelper
    {
        public static async Task<CloudTable> GetCloudTable(string name)
        {
            string connectionString = Environment.GetEnvironmentVariable("AzureStorage");
            // GET Storage account
            CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
            CloudTableClient cloudTableClient = cloudStorageAccount.CreateCloudTableClient();

            // Look for table X 
            CloudTable cloudTable = cloudTableClient.GetTableReference(name);

            // Creates table if not exists
            await cloudTable.CreateIfNotExistsAsync();

            return cloudTable;
        }
    }
}
