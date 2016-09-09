//This is your iForgot Backend configuration.
//It is imperative that you have a '/' at the end of each host in this config, see the examples.

module.exports = {
				 "port": 8081,

	"URLs": {
			"EdDataAPI": "URL matching your EdData API host, example: 'https://api.example.com/api/v1/' ",
			  "iForgot": "URL matching your iForgot server, example: 'https://iforgot.example.com/'",

		"PowershellAPI": "URL that matches your PowershellAPI server, example: 'https://psapi.example.com/' ",

				  "CAS": "URL that matches your CAS server, example: 'https://login.example.com/' "
	},

	"credentials": {
		"PowershellAPI": {
			 "username": "Username of a domain admin worthy of changing passwords.",
			 "password": "Same user's password.",
		},
		
		"EdDataAPI": {
			 "username": "Username of an EdDataAPI Admin",
			 "password": "Password of the same user"
		}
	},

	   "session_secret": "Secret phrase here.",
		  "admin_group": "What you want to find in the MemberOf property of an ADUser in order to grant them access to the Admin functionality of the Teacher tool."
}