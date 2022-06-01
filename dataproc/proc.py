import spacetrack.operators as op
from spacetrack import SpaceTrackClient
import pandas as pd
import skyfield.api as sky
from skyfield import timelib
import pymongo
import time
import json

st = SpaceTrackClient(identity='alexandreabouchahine@gmail.com', password='a2SzJcdBiqtd9j!')
mc = pymongo.MongoClient(username="alex", password="alex", connect=True)


catalogue = st.satcat(orderby='launch')

ls = st.generic_request("launch_site")
ls = {
    x["SITE_CODE"]: x["LAUNCH_SITE"] 
    for x in ls
}

countries = st.boxscore()
countries_mapping = {
    x["SPADOC_CD"]: x["COUNTRY"]
    for x in countries
}

remove_keys = {
    'COMMENT', 'COMMENTCODE', 'CURRENT', 'FILE', 'INTLDES', 'LAUNCH_NUM', 'LAUNCH_PIECE',
    'LAUNCH_YEAR', 'OBJECT_NAME', 'RCSVALUE', 'RCS_SIZE'
}
for s in catalogue:
    s["SITE"] = ls.get(s["SITE"], s["SITE"])
    s["COUNTRY"] = countries_mapping.get(s["COUNTRY"], s["COUNTRY"])
    for rk in remove_keys:
        del s[rk]

with open("satellites.txt", "w") as f:
    f.write(st.gp(epoch='>now-10', decay_date=None, format='3le'))
satellites = sky.load.tle_file("satellites.txt", skip_names=False)

active_sat = []
ts = sky.load.timescale()
t = ts.now() 
for s in satellites:
    if len(active_sat) > 10:
        break 

    lat = s.at(t).subpoint().latitude.degrees
    long = s.at(t).subpoint().longitude.degrees
    if s.name=="TBA - TO BE ASSIGNED" or lat is None or long is None:
        continue
    active_sat.append({
        'id': s.model.satnum,
        'name': s.name,
        'latitude': lat,
        'longitude': long,
        }
    )
    
mc["sat"].catalogue.insert_many(catalogue)
mc["sat"].countries.insert_many(countries)
mc["sat"].active.insert_many(active_sat)

files = [
    ("geo_lakes", "geodata/ne_50m_lakes.geojson"),
    ("geo_rivers", "geodata/ne_110m_rivers_lake_centerlines.geojson"),
    ("geo_countries", "geodata/ne_110m_admin_0_countries.geojson"),
    ("geo_oceans", "geodata/oceans.json"),
]

for name, file in files:
    with open(file, "r") as f:
        data = json.load(f)
    mc["sat"][name].insert_one(data)
