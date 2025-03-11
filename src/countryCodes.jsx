const countryCodes = [
  {
    "code": "+1",
    "countries": [
      { "name": "United States", "flag": "🇺🇸" },
      { "name": "Canada", "flag": "🇨🇦" },
      { "name": "Bahamas", "flag": "🇧🇸" },
      { "name": "Barbados", "flag": "🇧🇧" },
      { "name": "Jamaica", "flag": "🇯🇲" },
      { "name": "Trinidad and Tobago", "flag": "🇹🇹" }
    ],
    "continent": "North America"
  },
  {
    "code": "+52",
    "countries": [{ "name": "Mexico", "flag": "🇲🇽" }],
    "continent": "North America"
  },
  {
    "code": "+53",
    "countries": [{ "name": "Cuba", "flag": "🇨🇺" }],
    "continent": "North America"
  },
  {
    "code": "+54",
    "countries": [{ "name": "Argentina", "flag": "🇦🇷" }],
    "continent": "South America"
  },
  {
    "code": "+55",
    "countries": [{ "name": "Brazil", "flag": "🇧🇷" }],
    "continent": "South America"
  },
  {
    "code": "+56",
    "countries": [{ "name": "Chile", "flag": "🇨🇱" }],
    "continent": "South America"
  },
  {
    "code": "+57",
    "countries": [{ "name": "Colombia", "flag": "🇨🇴" }],
    "continent": "South America"
  },
  {
    "code": "+58",
    "countries": [{ "name": "Venezuela", "flag": "🇻🇪" }],
    "continent": "South America"
  },
  {
    "code": "+501",
    "countries": [{ "name": "Belize", "flag": "🇧🇿" }],
    "continent": "North America"
  },
  {
    "code": "+502",
    "countries": [{ "name": "Guatemala", "flag": "🇬🇹" }],
    "continent": "North America"
  },
  {
    "code": "+503",
    "countries": [{ "name": "El Salvador", "flag": "🇸🇻" }],
    "continent": "North America"
  },
  {
    "code": "+504",
    "countries": [{ "name": "Honduras", "flag": "🇭🇳" }],
    "continent": "North America"
  },
  {
    "code": "+505",
    "countries": [{ "name": "Nicaragua", "flag": "🇳🇮" }],
    "continent": "North America"
  },
  {
    "code": "+506",
    "countries": [{ "name": "Costa Rica", "flag": "🇨🇷" }],
    "continent": "North America"
  },
  {
    "code": "+507",
    "countries": [{ "name": "Panama", "flag": "🇵🇦" }],
    "continent": "North America"
  },
  {
    "code": "+509",
    "countries": [{ "name": "Haiti", "flag": "🇭🇹" }],
    "continent": "North America"
  },
  {
    "code": "+592",
    "countries": [{ "name": "Guyana", "flag": "🇬🇾" }],
    "continent": "South America"
  },
  {
    "code": "+593",
    "countries": [{ "name": "Ecuador", "flag": "🇪🇨" }],
    "continent": "South America"
  },
  {
    "code": "+594",
    "countries": [{ "name": "French Guiana", "flag": "🇬🇫" }],
    "continent": "South America"
  },
  {
    "code": "+595",
    "countries": [{ "name": "Paraguay", "flag": "🇵🇾" }],
    "continent": "South America"
  },
  {
    "code": "+597",
    "countries": [{ "name": "Suriname", "flag": "🇸🇷" }],
    "continent": "South America"
  },
  {
    "code": "+598",
    "countries": [{ "name": "Uruguay", "flag": "🇺🇾" }],
    "continent": "South America"
  },
  {
    "code": "+599",
    "countries": [{ "name": "Caribbean Netherlands", "flag": "🇧🇶" }],
    "continent": "North America"
  },
  {
    "code": "+30",
    "countries": [{ "name": "Greece", "flag": "🇬🇷" }],
    "continent": "Europe"
  },
  {
    "code": "+31",
    "countries": [{ "name": "Netherlands", "flag": "🇳🇱" }],
    "continent": "Europe"
  },
  {
    "code": "+32",
    "countries": [{ "name": "Belgium", "flag": "🇧🇪" }],
    "continent": "Europe"
  },
  {
    "code": "+33",
    "countries": [{ "name": "France", "flag": "🇫🇷" }],
    "continent": "Europe"
  },
  {
    "code": "+34",
    "countries": [{ "name": "Spain", "flag": "🇪🇸" }],
    "continent": "Europe"
  },
  {
    "code": "+36",
    "countries": [{ "name": "Hungary", "flag": "🇭🇺" }],
    "continent": "Europe"
  },
  {
    "code": "+39",
    "countries": [{ "name": "Italy", "flag": "🇮🇹" }],
    "continent": "Europe"
  },
  {
    "code": "+40",
    "countries": [{ "name": "Romania", "flag": "🇷🇴" }],
    "continent": "Europe"
  },
  {
    "code": "+41",
    "countries": [{ "name": "Switzerland", "flag": "🇨🇭" }],
    "continent": "Europe"
  },
  {
    "code": "+43",
    "countries": [{ "name": "Austria", "flag": "🇦🇹" }],
    "continent": "Europe"
  },
  {
    "code": "+44",
    "countries": [{ "name": "United Kingdom", "flag": "🇬🇧" }],
    "continent": "Europe"
  },
  {
    "code": "+45",
    "countries": [{ "name": "Denmark", "flag": "🇩🇰" }],
    "continent": "Europe"
  },
  {
    "code": "+46",
    "countries": [{ "name": "Sweden", "flag": "🇸🇪" }],
    "continent": "Europe"
  },
  {
    "code": "+47",
    "countries": [{ "name": "Norway", "flag": "🇳🇴" }],
    "continent": "Europe"
  },
  {
    "code": "+48",
    "countries": [{ "name": "Poland", "flag": "🇵🇱" }],
    "continent": "Europe"
  },
  {
    "code": "+49",
    "countries": [{ "name": "Germany", "flag": "🇩🇪" }],
    "continent": "Europe"
  },
  {
    "code": "+350",
    "countries": [{ "name": "Gibraltar", "flag": "🇬🇮" }],
    "continent": "Europe"
  },
  {
    "code": "+351",
    "countries": [{ "name": "Portugal", "flag": "🇵🇹" }],
    "continent": "Europe"
  },
  {
    "code": "+352",
    "countries": [{ "name": "Luxembourg", "flag": "🇱🇺" }],
    "continent": "Europe"
  },
  {
    "code": "+353",
    "countries": [{ "name": "Ireland", "flag": "🇮🇪" }],
    "continent": "Europe"
  },
  {
    "code": "+354",
    "countries": [{ "name": "Iceland", "flag": "🇮🇸" }],
    "continent": "Europe"
  },
  {
    "code": "+355",
    "countries": [{ "name": "Albania", "flag": "🇦🇱" }],
    "continent": "Europe"
  },
  {
    "code": "+356",
    "countries": [{ "name": "Malta", "flag": "🇲🇹" }],
    "continent": "Europe"
  },
  {
    "code": "+357",
    "countries": [{ "name": "Cyprus", "flag": "🇨🇾" }],
    "continent": "Europe"
  },
  {
    "code": "+358",
    "countries": [{ "name": "Finland", "flag": "🇫🇮" }],
    "continent": "Europe"
  },
  {
    "code": "+359",
    "countries": [{ "name": "Bulgaria", "flag": "🇧🇬" }],
    "continent": "Europe"
  },
  {
    "code": "+370",
    "countries": [{ "name": "Lithuania", "flag": "🇱🇹" }],
    "continent": "Europe"
  },
  {
    "code": "+371",
    "countries": [{ "name": "Latvia", "flag": "🇱🇻" }],
    "continent": "Europe"
  },
  {
    "code": "+372",
    "countries": [{ "name": "Estonia", "flag": "🇪🇪" }],
    "continent": "Europe"
  },
  {
    "code": "+373",
    "countries": [{ "name": "Moldova", "flag": "🇲🇩" }],
    "continent": "Europe"
  },
  {
    "code": "+374",
    "countries": [{ "name": "Armenia", "flag": "🇦🇲" }],
    "continent": "Europe"
  },
  {
    "code": "+375",
    "countries": [{ "name": "Belarus", "flag": "🇧🇾" }],
    "continent": "Europe"
  },
  {
    "code": "+376",
    "countries": [{ "name": "Andorra", "flag": "🇦🇩" }],
    "continent": "Europe"
  },
  {
    "code": "+377",
    "countries": [{ "name": "Monaco", "flag": "🇲🇨" }],
    "continent": "Europe"
  },
  {
    "code": "+378",
    "countries": [{ "name": "San Marino", "flag": "🇸🇲" }],
    "continent": "Europe"
  },
  {
    "code": "+380",
    "countries": [{ "name": "Ukraine", "flag": "🇺🇦" }],
    "continent": "Europe"
  },
  {
    "code": "+381",
    "countries": [{ "name": "Serbia", "flag": "🇷🇸" }],
    "continent": "Europe"
  },
  {
    "code": "+382",
    "countries": [{ "name": "Montenegro", "flag": "🇲🇪" }],
    "continent": "Europe"
  },
  {
    "code": "+383",
    "countries": [{ "name": "Kosovo", "flag": "🇽🇰" }],
    "continent": "Europe"
  },
  {
    "code": "+385",
    "countries": [{ "name": "Croatia", "flag": "🇭🇷" }],
    "continent": "Europe"
  },
  {
    "code": "+386",
    "countries": [{ "name": "Slovenia", "flag": "🇸🇮" }],
    "continent": "Europe"
  },
  {
    "code": "+387",
    "countries": [{ "name": "Bosnia and Herzegovina", "flag": "🇧🇦" }],
    "continent": "Europe"
  },
  {
    "code": "+389",
    "countries": [{ "name": "North Macedonia", "flag": "🇲🇰" }],
    "continent": "Europe"
  },
  {
    "code": "+420",
    "countries": [{ "name": "Czech Republic", "flag": "🇨🇿" }],
    "continent": "Europe"
  },
  {
    "code": "+421",
    "countries": [{ "name": "Slovakia", "flag": "🇸🇰" }],
    "continent": "Europe"
  },
  {
    "code": "+423",
    "countries": [{ "name": "Liechtenstein", "flag": "🇱🇮" }],
    "continent": "Europe"
  },
  {
    "code": "+7",
    "countries": [{ "name": "Russia", "flag": "🇷🇺" }],
    "continent": "Europe"
  },
  {
    "code": "+20",
    "countries": [{ "name": "Egypt", "flag": "🇪🇬" }],
    "continent": "Africa"
  },
  {
    "code": "+211",
    "countries": [{ "name": "South Sudan", "flag": "🇸🇸" }],
    "continent": "Africa"
  },
  {
    "code": "+212",
    "countries": [{ "name": "Morocco", "flag": "🇲🇦" }],
    "continent": "Africa"
  },
  {
    "code": "+213",
    "countries": [{ "name": "Algeria", "flag": "🇩🇿" }],
    "continent": "Africa"
  },
  {
    "code": "+216",
    "countries": [{ "name": "Tunisia", "flag": "🇹🇳" }],
    "continent": "Africa"
  },
  {
    "code": "+218",
    "countries": [{ "name": "Libya", "flag": "🇱🇾" }],
    "continent": "Africa"
  },
  {
    "code": "+220",
    "countries": [{ "name": "Gambia", "flag": "🇬🇲" }],
    "continent": "Africa"
  },
  {
    "code": "+221",
    "countries": [{ "name": "Senegal", "flag": "🇸🇳" }],
    "continent": "Africa"
  },
  {
    "code": "+222",
    "countries": [{ "name": "Mauritania", "flag": "🇲🇷" }],
    "continent": "Africa"
  },
  {
    "code": "+223",
    "countries": [{ "name": "Mali", "flag": "🇲🇱" }],
    "continent": "Africa"
  },
  {
    "code": "+224",
    "countries": [{ "name": "Guinea", "flag": "🇬🇳" }],
    "continent": "Africa"
  },
  {
    "code": "+225",
    "countries": [{ "name": "Ivory Coast", "flag": "🇨🇮" }],
    "continent": "Africa"
  },
  {
    "code": "+226",
    "countries": [{ "name": "Burkina Faso", "flag": "🇧🇫" }],
    "continent": "Africa"
  },
  {
    "code": "+227",
    "countries": [{ "name": "Niger", "flag": "🇳🇪" }],
    "continent": "Africa"
  },
  {
    "code": "+228",
    "countries": [{ "name": "Togo", "flag": "🇹🇬" }],
    "continent": "Africa"
  },
  {
    "code": "+229",
    "countries": [{ "name": "Benin", "flag": "🇧🇯" }],
    "continent": "Africa"
  },
  {
    "code": "+230",
    "countries": [{ "name": "Mauritius", "flag": "🇲🇺" }],
    "continent": "Africa"
  },
  {
    "code": "+231",
    "countries": [{ "name": "Liberia", "flag": "🇱🇷" }],
    "continent": "Africa"
  },
  {
    "code": "+232",
    "countries": [{ "name": "Sierra Leone", "flag": "🇸🇱" }],
    "continent": "Africa"
  },
  {
    "code": "+233",
    "countries": [{ "name": "Ghana", "flag": "🇬🇭" }],
    "continent": "Africa"
  },
  {
    "code": "+234",
    "countries": [{ "name": "Nigeria", "flag": "🇳🇬" }],
    "continent": "Africa"
  },
  {
    "code": "+235",
    "countries": [{ "name": "Chad", "flag": "🇹🇩" }],
    "continent": "Africa"
  },
  {
    "code": "+236",
    "countries": [{ "name": "Central African Republic", "flag": "🇨🇫" }],
    "continent": "Africa"
  },
  {
    "code": "+237",
    "countries": [{ "name": "Cameroon", "flag": "🇨🇲" }],
    "continent": "Africa"
  },
  {
    "code": "+238",
    "countries": [{ "name": "Cape Verde", "flag": "🇨🇻" }],
    "continent": "Africa"
  },
  {
    "code": "+239",
    "countries": [{ "name": "São Tomé and Príncipe", "flag": "🇸🇹" }],
    "continent": "Africa"
  },
  {
    "code": "+240",
    "countries": [{ "name": "Equatorial Guinea", "flag": "🇬🇶" }],
    "continent": "Africa"
  },
  {
    "code": "+241",
    "countries": [{ "name": "Gabon", "flag": "🇬🇦" }],
    "continent": "Africa"
  },
  {
    "code": "+242",
    "countries": [{ "name": "Republic of the Congo", "flag": "🇨🇬" }],
    "continent": "Africa"
  },
  {
    "code": "+243",
    "countries": [{ "name": "Democratic Republic of the Congo", "flag": "🇨🇩" }],
    "continent": "Africa"
  },
  {
    "code": "+244",
    "countries": [{ "name": "Angola", "flag": "🇦🇴" }],
    "continent": "Africa"
  },
  {
    "code": "+245",
    "countries": [{ "name": "Guinea-Bissau", "flag": "🇬🇼" }],
    "continent": "Africa"
  },
  {
    "code": "+248",
    "countries": [{ "name": "Seychelles", "flag": "🇸🇨" }],
    "continent": "Africa"
  },
  {
    "code": "+249",
    "countries": [{ "name": "Sudan", "flag": "🇸🇩" }],
    "continent": "Africa"
  },
  {
    "code": "+250",
    "countries": [{ "name": "Rwanda", "flag": "🇷🇼" }],
    "continent": "Africa"
  },
  {
    "code": "+251",
    "countries": [{ "name": "Ethiopia", "flag": "🇪🇹" }],
    "continent": "Africa"
  },
  {
    "code": "+252",
    "countries": [{ "name": "Somalia", "flag": "🇸🇴" }],
    "continent": "Africa"
  },
  {
    "code": "+253",
    "countries": [{ "name": "Djibouti", "flag": "🇩🇯" }],
    "continent": "Africa"
  },
  {
    "code": "+254",
    "countries": [{ "name": "Kenya", "flag": "🇰🇪" }],
    "continent": "Africa"
  },
  {
    "code": "+255",
    "countries": [{ "name": "Tanzania", "flag": "🇹🇿" }],
    "continent": "Africa"
  },
  {
    "code": "+256",
    "countries": [{ "name": "Uganda", "flag": "🇺🇬" }],
    "continent": "Africa"
  },
  {
    "code": "+257",
    "countries": [{ "name": "Burundi", "flag": "🇧🇮" }],
    "continent": "Africa"
  },
  {
    "code": "+258",
    "countries": [{ "name": "Mozambique", "flag": "🇲🇿" }],
    "continent": "Africa"
  },
  {
    "code": "+260",
    "countries": [{ "name": "Zambia", "flag": "🇿🇲" }],
    "continent": "Africa"
  },
  {
    "code": "+261",
    "countries": [{ "name": "Madagascar", "flag": "🇲🇬" }],
    "continent": "Africa"
  },
  {
    "code": "+263",
    "countries": [{ "name": "Zimbabwe", "flag": "🇿🇼" }],
    "continent": "Africa"
  },
  {
    "code": "+264",
    "countries": [{ "name": "Namibia", "flag": "🇳🇦" }],
    "continent": "Africa"
  },
  {
    "code": "+265",
    "countries": [{ "name": "Malawi", "flag": "🇲🇼" }],
    "continent": "Africa"
  },
  {
    "code": "+266",
    "countries": [{ "name": "Lesotho", "flag": "🇱🇸" }],
    "continent": "Africa"
  },
  {
    "code": "+267",
    "countries": [{ "name": "Botswana", "flag": "🇧🇼" }],
    "continent": "Africa"
  },
  {
    "code": "+268",
    "countries": [{ "name": "Eswatini", "flag": "🇸🇿" }],
    "continent": "Africa"
  },
  {
    "code": "+27",
    "countries": [{ "name": "South Africa", "flag": "🇿🇦" }],
    "continent": "Africa"
  },
  {
    "code": "+90",
    "countries": [{ "name": "Turkey", "flag": "🇹🇷" }],
    "continent": "Asia"
  },
  {
    "code": "+964",
    "countries": [{ "name": "Iraq", "flag": "🇮🇶" }],
    "continent": "Asia"
  },
  {
    "code": "+965",
    "countries": [{ "name": "Kuwait", "flag": "🇰🇼" }],
    "continent": "Asia"
  },
  {
    "code": "+966",
    "countries": [{ "name": "Saudi Arabia", "flag": "🇸🇦" }],
    "continent": "Asia"
  },
  {
    "code": "+967",
    "countries": [{ "name": "Yemen", "flag": "🇾🇪" }],
    "continent": "Asia"
  },
  {
    "code": "+968",
    "countries": [{ "name": "Oman", "flag": "🇴🇲" }],
    "continent": "Asia"
  },
  {
    "code": "+970",
    "countries": [{ "name": "Palestine", "flag": "🇵🇸" }],
    "continent": "Asia"
  },
  {
    "code": "+971",
    "countries": [{ "name": "United Arab Emirates", "flag": "🇦🇪" }],
    "continent": "Asia"
  },
  {
    "code": "+972",
    "countries": [{ "name": "Israel", "flag": "🇮🇱" }],
    "continent": "Asia"
  },
  {
    "code": "+973",
    "countries": [{ "name": "Bahrain", "flag": "🇧🇭" }],
    "continent": "Asia"
  },
  {
    "code": "+974",
    "countries": [{ "name": "Qatar", "flag": "🇶🇦" }],
    "continent": "Asia"
  },
  {
    "code": "+975",
    "countries": [{ "name": "Bhutan", "flag": "🇧🇹" }],
    "continent": "Asia"
  },
  {
    "code": "+976",
    "countries": [{ "name": "Mongolia", "flag": "🇲🇳" }],
    "continent": "Asia"
  },
  {
    "code": "+981",
    "countries": [{ "name": "Iran", "flag": "🇮🇷" }],
    "continent": "Asia"
  },
  {
    "code": "+963",
    "countries": [{ "name": "Syria", "flag": "🇸🇾" }],
    "continent": "Asia"
  },
  {
    "code": "+962",
    "countries": [{ "name": "Jordan", "flag": "🇯🇴" }],
    "continent": "Asia"
  },
  {
    "code": "+961",
    "countries": [{ "name": "Lebanon", "flag": "🇱🇧" }],
    "continent": "Asia"
  },
  {
    "code": "+93",
    "countries": [{ "name": "Afghanistan", "flag": "🇦🇫" }],
    "continent": "Asia"
  },
  {
    "code": "+880",
    "countries": [{ "name": "Bangladesh", "flag": "🇧🇩" }],
    "continent": "Asia"
  },
  {
    "code": "+86",
    "countries": [{ "name": "China", "flag": "🇨🇳" }],
    "continent": "Asia"
  },
  {
    "code": "+852",
    "countries": [{ "name": "Hong Kong", "flag": "🇭🇰" }],
    "continent": "Asia"
  },
  {
    "code": "+91",
    "countries": [{ "name": "India", "flag": "🇮🇳" }],
    "continent": "Asia"
  },
  {
    "code": "+62",
    "countries": [{ "name": "Indonesia", "flag": "🇮🇩" }],
    "continent": "Asia"
  },  {
    "code": "+81",
    "countries": [{ "name": "Japan", "flag": "🇯🇵" }],
    "continent": "Asia"
  },
  {
    "code": "+82",
    "countries": [{ "name": "South Korea", "flag": "🇰🇷" }],
    "continent": "Asia"
  },
  {
    "code": "+856",
    "countries": [{ "name": "Laos", "flag": "🇱🇦" }],
    "continent": "Asia"
  },
  {
    "code": "+60",
    "countries": [{ "name": "Malaysia", "flag": "🇲🇾" }],
    "continent": "Asia"
  },
  {
    "code": "+960",
    "countries": [{ "name": "Maldives", "flag": "🇲🇻" }],
    "continent": "Asia"
  },
  {
    "code": "+95",
    "countries": [{ "name": "Myanmar", "flag": "🇲🇲" }],
    "continent": "Asia"
  },
  {
    "code": "+977",
    "countries": [{ "name": "Nepal", "flag": "🇳🇵" }],
    "continent": "Asia"
  },
  {
    "code": "+63",
    "countries": [{ "name": "Philippines", "flag": "🇵🇭" }],
    "continent": "Asia"
  },
  {
    "code": "+65",
    "countries": [{ "name": "Singapore", "flag": "🇸🇬" }],
    "continent": "Asia"
  },
  {
    "code": "+94",
    "countries": [{ "name": "Sri Lanka", "flag": "🇱🇰" }],
    "continent": "Asia"
  },
  {
    "code": "+886",
    "countries": [{ "name": "Taiwan", "flag": "🇹🇼" }],
    "continent": "Asia"
  },
  {
    "code": "+66",
    "countries": [{ "name": "Thailand", "flag": "🇹🇭" }],
    "continent": "Asia"
  },
  {
    "code": "+84",
    "countries": [{ "name": "Vietnam", "flag": "🇻🇳" }],
    "continent": "Asia"
  },
  {
    "code": "+7",
    "countries": [
      { "name": "Kazakhstan", "flag": "🇰🇿" },
      { "name": "Russia", "flag": "🇷🇺" }
    ],
    "continent": "Asia"
  },
  {
    "code": "+998",
    "countries": [{ "name": "Uzbekistan", "flag": "🇺🇿" }],
    "continent": "Asia"
  },
  {
    "code": "+996",
    "countries": [{ "name": "Kyrgyzstan", "flag": "🇰🇬" }],
    "continent": "Asia"
  },
  {
    "code": "+993",
    "countries": [{ "name": "Turkmenistan", "flag": "🇹🇲" }],
    "continent": "Asia"
  },
  {
    "code": "+992",
    "countries": [{ "name": "Tajikistan", "flag": "🇹🇯" }],
    "continent": "Asia"
  },
  {
    "code": "+976",
    "countries": [{ "name": "Mongolia", "flag": "🇲🇳" }],
    "continent": "Asia"
  }
];

export default countryCodes;