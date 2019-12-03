*UN skills
import delimited C:\Users\jccaro\junaeb\data\cned\baseindices_2005-2019_0.csv, delimiter(",") clear

rename ïaão anio
gen year=.
replace year=2005 if anio=="2005"
replace year=2006 if anio=="2006"
replace year=2007 if anio=="2007"
replace year=2008 if anio=="2008"
replace year=2009 if anio=="2009"
replace year=2010 if anio=="2010"
replace year=2011 if anio=="2011"
replace year=2012 if anio=="2012"
replace year=2013 if anio=="2013"
replace year=2014 if anio=="2014"
replace year=2015 if anio=="2015"
replace year=2016 if anio=="2016"
replace year=2017 if anio=="2017"
replace year=2018 if anio=="2018"
replace year=2019 if anio=="2019"


gen area=.
replace area=1 if areaconocimiento=="AdministraciÃ³n y Comercio"
replace area=2 if areaconocimiento=="Arte y Arquitectura"
replace area=3 if areaconocimiento=="Ciencias"
replace area=4 if areaconocimiento=="Ciencias Sociales"
replace area=5 if areaconocimiento=="Derecho"
replace area=6 if areaconocimiento=="EducaciÃ³n"
replace area=2 if areaconocimiento=="Humanidades"
replace area=7 if areaconocimiento=="Salud"
replace area=8 if areaconocimiento=="TecnologÃ­a"
replace area=3 if area==8
label define area 1 "Business" 2 "Art/Humanities" 3 "STEM" 4 "SocSci" 5 "Law" 6 "Education" 7 "Health"
label values area area


rename puntajedecortepromediodelacarrer puntaje
gen dp=0
replace dp=1 if puntaje==.

rename cãdcarrera idc
rename matrãculatotal ingreso
rename nâºalumnosingresopsu ingreso2
rename promediopuntajenem puntajenem
destring idc, replace
destring ordengeogrãficodelaregiãnnorteas, replace
rename ordengeogrãficodelaregiãnnorteas region

keep if pregradoposgrado=="Pregrado"
drop matrãculaprimeraãohombres matrãculaprimeraãomujeres matrãculaprimeraãoextranjeros matrãculaprimeraão matrãculatotalhombres matrãculatotalmujeres matrãculatotalextranjeros
drop idgenerocarrera mãximopuntajepsupromediomatemãti promediopuntajepsupromediomatemã mãnimopuntajepsupromediomatemãti puntajedecorteprimerseleccionado
drop puntajedecorteãºltimoseleccionad mãximopuntajenem mãnimopuntajenem mãximopuntajeranking promediopuntajeranking mãnimopuntajeranking 
drop pregradoposgrado valordeltãtulo valordearancel valordematrãcula nâºalumnosingresootravia
drop areaconocimiento carreragenãrica anio cãdinstituciãn

save "C:\Users\jccaro\junaeb\data\cned.dta", replace
