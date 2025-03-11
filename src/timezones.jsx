const timezoneData = [
  // UTC
    // Afghanistan
    { city: "Kabul", country: "Afghanistan", gmt: "GMT+4:30", value: "Asia/Kabul" },
  
    // Albania
    { city: "Tirana", country: "Albania", gmt: "GMT+1", value: "Europe/Tirane" },
  
    // Algeria
    { city: "Algiers", country: "Algeria", gmt: "GMT+1", value: "Africa/Algiers" },
  
    // Andorra
    { city: "Andorra la Vella", country: "Andorra", gmt: "GMT+1", value: "Europe/Andorra" },
  
    // Angola
    { city: "Luanda", country: "Angola", gmt: "GMT+1", value: "Africa/Luanda" },
  
    // Argentina
    { city: "Buenos Aires", country: "Argentina", gmt: "GMT-3", value: "America/Argentina/Buenos_Aires" },
  
    // Armenia
    { city: "Yerevan", country: "Armenia", gmt: "GMT+4", value: "Asia/Yerevan" },
  
    // Austria
    { city: "Vienna", country: "Austria", gmt: "GMT+1", value: "Europe/Vienna" },
  
    // Bahrain
    { city: "Manama", country: "Bahrain", gmt: "GMT+3", value: "Asia/Bahrain" },
  
    // Bangladesh
    { city: "Dhaka", country: "Bangladesh", gmt: "GMT+6", value: "Asia/Dhaka" },
  
    // Belarus
    { city: "Minsk", country: "Belarus", gmt: "GMT+3", value: "Europe/Minsk" },
  
    // Belgium
    { city: "Brussels", country: "Belgium", gmt: "GMT+1", value: "Europe/Brussels" },
  
    // Belize
    { city: "Belmopan", country: "Belize", gmt: "GMT-6", value: "America/Belize" },
  
    // Benin
    { city: "Porto-Novo", country: "Benin", gmt: "GMT+1", value: "Africa/Porto-Novo" },
  
    // Bhutan
    { city: "Thimphu", country: "Bhutan", gmt: "GMT+6", value: "Asia/Thimphu" },
  
    // Bosnia and Herzegovina
    { city: "Sarajevo", country: "Bosnia and Herzegovina", gmt: "GMT+1", value: "Europe/Sarajevo" },
  
    // Botswana
    { city: "Gaborone", country: "Botswana", gmt: "GMT+2", value: "Africa/Gaborone" },
  
    // Brazil
    { city: "São Paulo", country: "Brazil", gmt: "GMT-3", value: "America/Sao_Paulo" },
  
    // Bulgaria
    { city: "Sofia", country: "Bulgaria", gmt: "GMT+2", value: "Europe/Sofia" },
  
    // Burkina Faso
    { city: "Ouagadougou", country: "Burkina Faso", gmt: "GMT+0", value: "Africa/Ouagadougou" },
  
    // Burundi
    { city: "Bujumbura", country: "Burundi", gmt: "GMT+2", value: "Africa/Bujumbura" },
  
    // Cameroon
    { city: "Yaoundé", country: "Cameroon", gmt: "GMT+1", value: "Africa/Douala" },
  
    // Cape Verde
    { city: "Praia", country: "Cape Verde", gmt: "GMT-1", value: "Atlantic/Cape_Verde" },
  
    // Caribbean Netherlands
    { city: "Kralendijk", country: "Caribbean Netherlands", gmt: "GMT-4", value: "America/Kralendijk" },
  
    // Central African Republic
    { city: "Bangui", country: "Central African Republic", gmt: "GMT+1", value: "Africa/Bangui" },
  
    // Chad
    { city: "N'Djamena", country: "Chad", gmt: "GMT+1", value: "Africa/Ndjamena" },
  
    // Chile
    { city: "Santiago", country: "Chile", gmt: "GMT-4", value: "America/Santiago" },
  
    // China
    { city: "Beijing", country: "China", gmt: "GMT+8", value: "Asia/Shanghai" },
  
    // Colombia
    { city: "Bogotá", country: "Colombia", gmt: "GMT-5", value: "America/Bogota" },
  
    // Costa Rica
    { city: "San José", country: "Costa Rica", gmt: "GMT-6", value: "America/Costa_Rica" },
  
    // Croatia
    { city: "Zagreb", country: "Croatia", gmt: "GMT+1", value: "Europe/Zagreb" },
  
    // Cuba
    { city: "Havana", country: "Cuba", gmt: "GMT-5", value: "America/Havana" },
  
    // Cyprus
    { city: "Nicosia", country: "Cyprus", gmt: "GMT+2", value: "Asia/Nicosia" },
  
    // Czech Republic
    { city: "Prague", country: "Czech Republic", gmt: "GMT+1", value: "Europe/Prague" },
  
    // Democratic Republic of the Congo
    { city: "Kinshasa", country: "Democratic Republic of the Congo", gmt: "GMT+1", value: "Africa/Kinshasa" },
  
    // Denmark
    { city: "Copenhagen", country: "Denmark", gmt: "GMT+1", value: "Europe/Copenhagen" },
  
    // Djibouti
    { city: "Djibouti", country: "Djibouti", gmt: "GMT+3", value: "Africa/Djibouti" },
  
    // Ecuador
    { city: "Quito", country: "Ecuador", gmt: "GMT-5", value: "America/Guayaquil" },
  
    // Egypt
    { city: "Cairo", country: "Egypt", gmt: "GMT+2", value: "Africa/Cairo" },
  
    // El Salvador
    { city: "San Salvador", country: "El Salvador", gmt: "GMT-6", value: "America/El_Salvador" },
  
    // Equatorial Guinea
    { city: "Malabo", country: "Equatorial Guinea", gmt: "GMT+1", value: "Africa/Malabo" },
  
    // Estonia
    { city: "Tallinn", country: "Estonia", gmt: "GMT+2", value: "Europe/Tallinn" },
  
    // Eswatini
    { city: "Mbabane", country: "Eswatini", gmt: "GMT+2", value: "Africa/Mbabane" },
  
    // Ethiopia
    { city: "Addis Ababa", country: "Ethiopia", gmt: "GMT+3", value: "Africa/Addis_Ababa" },
  
    // Finland
    { city: "Helsinki", country: "Finland", gmt: "GMT+2", value: "Europe/Helsinki" },
  
    // France
    { city: "Paris", country: "France", gmt: "GMT+1", value: "Europe/Paris" },
  
    // French Guiana
    { city: "Cayenne", country: "French Guiana", gmt: "GMT-3", value: "America/Cayenne" },
  
    // Gabon
    { city: "Libreville", country: "Gabon", gmt: "GMT+1", value: "Africa/Libreville" },
  
    // Gambia
    { city: "Banjul", country: "Gambia", gmt: "GMT+0", value: "Africa/Banjul" },
  
    // Germany
    { city: "Berlin", country: "Germany", gmt: "GMT+1", value: "Europe/Berlin" },
  
    // Ghana
    { city: "Accra", country: "Ghana", gmt: "GMT+0", value: "Africa/Accra" },
  
    // Gibraltar
    { city: "Gibraltar", country: "Gibraltar", gmt: "GMT+1", value: "Europe/Gibraltar" },
  
    // Greece
    { city: "Athens", country: "Greece", gmt: "GMT+2", value: "Europe/Athens" },
    { city: "San Marino", country: "San Marino", gmt: "GMT+1", value: "Europe/San_Marino" },
  { city: "Riyadh", country: "Saudi Arabia", gmt: "GMT+3", value: "Asia/Riyadh" },
  { city: "Dakar", country: "Senegal", gmt: "GMT+0", value: "Africa/Dakar" },
  { city: "Belgrade", country: "Serbia", gmt: "GMT+1", value: "Europe/Belgrade" },
  { city: "Victoria", country: "Seychelles", gmt: "GMT+4", value: "Indian/Mahe" },
  { city: "Freetown", country: "Sierra Leone", gmt: "GMT+0", value: "Africa/Freetown" },
  { city: "Singapore", country: "Singapore", gmt: "GMT+8", value: "Asia/Singapore" },
  { city: "Bratislava", country: "Slovakia", gmt: "GMT+1", value: "Europe/Bratislava" },
  { city: "Ljubljana", country: "Slovenia", gmt: "GMT+1", value: "Europe/Ljubljana" },
  { city: "Mogadishu", country: "Somalia", gmt: "GMT+3", value: "Africa/Mogadishu" },
  { city: "Pretoria", country: "South Africa", gmt: "GMT+2", value: "Africa/Johannesburg" },
  { city: "Seoul", country: "South Korea", gmt: "GMT+9", value: "Asia/Seoul" },
  { city: "Juba", country: "South Sudan", gmt: "GMT+2", value: "Africa/Juba" },
  { city: "Madrid", country: "Spain", gmt: "GMT+1", value: "Europe/Madrid" },
  { city: "Colombo", country: "Sri Lanka", gmt: "GMT+5:30", value: "Asia/Colombo" },
  { city: "Khartoum", country: "Sudan", gmt: "GMT+2", value: "Africa/Khartoum" },
  { city: "Paramaribo", country: "Suriname", gmt: "GMT-3", value: "America/Paramaribo" },
  { city: "Stockholm", country: "Sweden", gmt: "GMT+1", value: "Europe/Stockholm" },
  { city: "Zurich", country: "Switzerland", gmt: "GMT+1", value: "Europe/Zurich" },
  { city: "Damascus", country: "Syria", gmt: "GMT+2", value: "Asia/Damascus" },
  { city: "São Tomé", country: "São Tomé and Príncipe", gmt: "GMT+0", value: "Africa/Sao_Tome" },
  { city: "Guatemala City", country: "Guatemala", gmt: "GMT-6", value: "America/Guatemala" },
  { city: "Conakry", country: "Guinea", gmt: "GMT+0", value: "Africa/Conakry" },
  { city: "Bissau", country: "Guinea-Bissau", gmt: "GMT+0", value: "Africa/Bissau" },
  { city: "Georgetown", country: "Guyana", gmt: "GMT-4", value: "America/Guyana" },
  { city: "Port-au-Prince", country: "Haiti", gmt: "GMT-5", value: "America/Port-au-Prince" },
  { city: "Tegucigalpa", country: "Honduras", gmt: "GMT-6", value: "America/Tegucigalpa" },
  { city: "Hong Kong", country: "Hong Kong", gmt: "GMT+8", value: "Asia/Hong_Kong" },
  { city: "Budapest", country: "Hungary", gmt: "GMT+1", value: "Europe/Budapest" },
  { city: "Reykjavik", country: "Iceland", gmt: "GMT+0", value: "Atlantic/Reykjavik" },
  { city: "New Delhi", country: "India", gmt: "GMT+5:30", value: "Asia/Kolkata" },
  { city: "Jakarta", country: "Indonesia", gmt: "GMT+7", value: "Asia/Jakarta" },
  { city: "Tehran", country: "Iran", gmt: "GMT+3:30", value: "Asia/Tehran" },
  { city: "Baghdad", country: "Iraq", gmt: "GMT+3", value: "Asia/Baghdad" },
  { city: "Dublin", country: "Ireland", gmt: "GMT+1", value: "Europe/Dublin" },
  { city: "Jerusalem", country: "Israel", gmt: "GMT+2", value: "Asia/Jerusalem" },
  { city: "Rome", country: "Italy", gmt: "GMT+1", value: "Europe/Rome" },
  { city: "Yamoussoukro", country: "Ivory Coast", gmt: "GMT+0", value: "Africa/Abidjan" },
  { city: "Tokyo", country: "Japan", gmt: "GMT+9", value: "Asia/Tokyo" },
  { city: "Amman", country: "Jordan", gmt: "GMT+2", value: "Asia/Amman" },
  { city: "Nairobi", country: "Kenya", gmt: "GMT+3", value: "Africa/Nairobi" },
  { city: "Pristina", country: "Kosovo", gmt: "GMT+1", value: "Europe/Belgrade" },
  { city: "Kuwait City", country: "Kuwait", gmt: "GMT+3", value: "Asia/Kuwait" },
  { city: "Bishkek", country: "Kyrgyzstan", gmt: "GMT+6", value: "Asia/Bishkek" },
  { city: "Vientiane", country: "Laos", gmt: "GMT+7", value: "Asia/Vientiane" },
  { city: "Riga", country: "Latvia", gmt: "GMT+2", value: "Europe/Riga" },
  { city: "Beirut", country: "Lebanon", gmt: "GMT+2", value: "Asia/Beirut" },
  { city: "Maseru", country: "Lesotho", gmt: "GMT+2", value: "Africa/Maseru" },
  { city: "Monrovia", country: "Liberia", gmt: "GMT+0", value: "Africa/Monrovia" },
  { city: "Tripoli", country: "Libya", gmt: "GMT+2", value: "Africa/Tripoli" },
  { city: "Vaduz", country: "Liechtenstein", gmt: "GMT+1", value: "Europe/Vaduz" },
  { city: "Vilnius", country: "Lithuania", gmt: "GMT+2", value: "Europe/Vilnius" },
  { city: "Luxembourg", country: "Luxembourg", gmt: "GMT+1", value: "Europe/Luxembourg" },
  { city: "Antananarivo", country: "Madagascar", gmt: "GMT+3", value: "Indian/Antananarivo" },
  { city: "Lilongwe", country: "Malawi", gmt: "GMT+2", value: "Africa/Blantyre" },
  { city: "Kuala Lumpur", country: "Malaysia", gmt: "GMT+8", value: "Asia/Kuala_Lumpur" },
  { city: "Malé", country: "Maldives", gmt: "GMT+5", value: "Indian/Maldives" },
  { city: "Bamako", country: "Mali", gmt: "GMT+0", value: "Africa/Bamako" },
  { city: "Valletta", country: "Malta", gmt: "GMT+1", value: "Europe/Malta" },
  { city: "Nouakchott", country: "Mauritania", gmt: "GMT+0", value: "Africa/Nouakchott" },
  { city: "Port Louis", country: "Mauritius", gmt: "GMT+4", value: "Indian/Mauritius" },
  { city: "Mexico City", country: "Mexico", gmt: "GMT-6", value: "America/Mexico_City" },
  { city: "Chisinau", country: "Moldova", gmt: "GMT+2", value: "Europe/Chisinau" },
  { city: "Monaco", country: "Monaco", gmt: "GMT+1", value: "Europe/Monaco" },
  { city: "Ulaanbaatar", country: "Mongolia", gmt: "GMT+8", value: "Asia/Ulaanbaatar" },
  { city: "Podgorica", country: "Montenegro", gmt: "GMT+1", value: "Europe/Podgorica" },
  { city: "Rabat", country: "Morocco", gmt: "GMT+1", value: "Africa/Casablanca" },
  { city: "Maputo", country: "Mozambique", gmt: "GMT+2", value: "Africa/Maputo" },
  { city: "Naypyidaw", country: "Myanmar", gmt: "GMT+6:30", value: "Asia/Yangon" },
  { city: "Windhoek", country: "Namibia", gmt: "GMT+2", value: "Africa/Windhoek" },
  { city: "Kathmandu", country: "Nepal", gmt: "GMT+5:45", value: "Asia/Kathmandu" },
  { city: "Amsterdam", country: "Netherlands", gmt: "GMT+1", value: "Europe/Amsterdam" },
  { city: "Managua", country: "Nicaragua", gmt: "GMT-6", value: "America/Managua" },
  { city: "Niamey", country: "Niger", gmt: "GMT+1", value: "Africa/Niamey" },
  { city: "Abuja", country: "Nigeria", gmt: "GMT+1", value: "Africa/Lagos" },
  { city: "Skopje", country: "North Macedonia", gmt: "GMT+1", value: "Europe/Skopje" },
  { city: "Oslo", country: "Norway", gmt: "GMT+1", value: "Europe/Oslo" },
  { city: "Muscat", country: "Oman", gmt: "GMT+4", value: "Asia/Muscat" },
  { city: "Ramallah", country: "Palestine", gmt: "GMT+2", value: "Asia/Gaza" }, // Palestine uses Gaza or Hebron timezone
  { city: "Panama City", country: "Panama", gmt: "GMT-5", value: "America/Panama" },
  { city: "Asunción", country: "Paraguay", gmt: "GMT-4", value: "America/Asuncion" },
  { city: "Manila", country: "Philippines", gmt: "GMT+8", value: "Asia/Manila" },
  { city: "Warsaw", country: "Poland", gmt: "GMT+1", value: "Europe/Warsaw" },
  { city: "Lisbon", country: "Portugal", gmt: "GMT+1", value: "Europe/Lisbon" },
  { city: "Doha", country: "Qatar", gmt: "GMT+3", value: "Asia/Qatar" },
  { city: "Brazzaville", country: "Republic of the Congo", gmt: "GMT+1", value: "Africa/Brazzaville" },
  { city: "Bucharest", country: "Romania", gmt: "GMT+2", value: "Europe/Bucharest" },
  { city: "Moscow", country: "Russia", gmt: "GMT+3", value: "Europe/Moscow" }, // Russia has multiple timezones; Moscow is the most prominent
  { city: "Kigali", country: "Rwanda", gmt: "GMT+2", value: "Africa/Kigali" },
  { city: "Dubai", country: "United Arab Emirates", gmt: "GMT+4", value: "Asia/Dubai" }
];

export default timezoneData;