package main

import(
    "fmt"
    "os"
    "net/http"
    "io"
    "encoding/json"
    "log"
    "net/url"
    "net/http/cookiejar"
    "strings"
)

const (
    ST_URL = "https://www.space-track.org/"
    ST_QUERY_BASE = "https://www.space-track.org/basicspacedata/query/class/"
)

type Satellite struct{
  NORAD_CAT_ID string
	OBJECT_TYPE string
	SATNAME string
	COUNTRY string
	LAUNCH string
	SITE string
	DECAY string
	PERIOD string
	INCLINATION string
	APOGEE string
	PERIGEE string
	OBJECT_ID string
	OBJECT_NUMBER string
}

func GetStCredentials() (string, string){
    usr, ok := os.LookupEnv("ST_USR")
    if ok != true{
      panic("No SpaceTrack username found")
    }
    pwd, ok := os.LookupEnv("ST_PWD")
    if ok != true{
        panic("No SpaceTrack password found")
    }
    return usr, pwd
}

func LoginSt(client *http.Client){
    usr, pwd := GetStCredentials()
    data := url.Values{}
    data.Set("identity", usr)
    data.Set("password", pwd)
    loginUrl :=  ST_URL + "/ajaxauth/login"
    _, err := client.PostForm(loginUrl, data)
    if err != nil{
        fmt.Println(err)
    }
}

func GetSatCatalogue(client *http.Client) []Satellite{
    predicate := "satcat/format/json"
    query := ST_QUERY_BASE + predicate
    res, _ := client.Get(query)
    data := GetResBody(res)
    var satellites []Satellite
    err := json.Unmarshal(data, &satellites)
    if err != nil{
        fmt.Println(err)
    }
    launchSiteMapping := GetLaunchSiteMapping(client)
    countryMapping := GetCountryMapping(client)
    for i := range satellites{
      satellite := &satellites[i]
      satellite.COUNTRY = countryMapping[satellite.COUNTRY].(string)
      satellite.SITE = launchSiteMapping[satellite.SITE].(string)
    }
    return satellites
}

func GetLaunchSiteMapping(client *http.Client) map[string]interface{}{
    predicate := "launch_site/format/json"
    query := ST_QUERY_BASE + predicate
    res, _ := client.Get(query)
    body := GetResBody(res)
    result := GetJsonBody(body)
    launchSiteMapping := make(map[string]interface{})
    for _, val := range result{
        siteCode, err1 := val["SITE_CODE"].(string)
        launchSite, err2 := val["LAUNCH_SITE"].(string)
        if err1 != false && err2 != false{
            launchSiteMapping[siteCode] = launchSite
        }
    }
    return launchSiteMapping
}

func GetCountryMapping(client *http.Client) map[string]interface{}{
    predicate := "boxscore/format/json"
    query := ST_QUERY_BASE + predicate
    res, _ := client.Get(query)
    body := GetResBody(res)
    result := GetJsonBody(body)
    countryMapping := make(map[string]interface{})
    for _, val := range result{
        spadocCd, err1 := val["SPADOC_CD"].(string)
        country, err2 := val["COUNTRY"].(string)
        if err1 != false && err2 != false{
            countryMapping[spadocCd] = country
        }
    }
    return countryMapping
}

func GetActiveSat(client *http.Client) []map[string]interface{}{
    predicate := "gp/decay_date/null-val/epoch/>now-10/COUNTRY_CODE/FR/format/tle"
    query := ST_QUERY_BASE + predicate
    var activeSat []map[string]interface{}
    res, err := client.Get(query)
    if err != nil{
      log.Fatal(err)
    }
    lines := strings.Split(strings.TrimSpace(string(GetResBody(res))), "\n")
    for i:=0; i<len(lines)-1; i=i+2{
        line1 := strings.TrimSpace(lines[i])
        line2 := strings.TrimSpace(lines[i+1])
        activeSat = append(activeSat, map[string]interface{}{"line1": line1, "line2": line2})
    }
    return activeSat
}

func GetResBody(res *http.Response) []byte{
	body, err := io.ReadAll(res.Body)
	res.Body.Close()
	if res.StatusCode > 299 {
		log.Fatalf("Response failed with status code: %d and\nbody: %s\n", res.StatusCode, body)
	}
	if err != nil {
		log.Fatal(err)
	}
	return body
}

func GetJsonBody(body []byte) []map[string]interface{}{
    var result []map[string]interface{}
    err := json.Unmarshal(body, &result)
    if err != nil{
        fmt.Println(err)
    }
    return result
}

func updateData() error{
  jar, _ := cookiejar.New(nil)
  client := &http.Client{Jar: jar}

  LoginSt(client)

  // Updating the catalogue
  satCat := GetSatCatalogue(client)
  satCatItf := make([]interface{}, len(satCat))
  for i, v := range satCat {  
    satCatItf[i] = v
  }
  err := updateCollection("catalogue", satCatItf)
  if err != nil{
    return err
  }

  // Updating the active satellites
  activeSat := GetActiveSat(client)
  activeSatItf := make([]interface{}, len(activeSat))
  for i, v := range activeSat {
      activeSatItf[i] = v
  }
  err := updateCollection("active_french", activeSatItf)
  if err != nil{
    return err
  }
  
  return nil
}
