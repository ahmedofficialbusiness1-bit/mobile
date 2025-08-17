# Maelekezo ya Kupeleka Mabadiliko Kwenye GitHub

Hongera kwa kumaliza maboresho ya mfumo wako wa MaliMax! Sasa ni wakati wa kupeleka mabadiliko haya kwenye GitHub ili Netlify iweze kuyachapisha (deploy).

Fuata hatua hizi rahisi:

### Hatua za Kufuata Kwenye Terminal/Command Line

Fungua terminal au command prompt kwenye kompyuta yako na nenda kwenye folder la mradi wako. Kisha andika amri (commands) zifuatazo moja baada ya nyingine.

**1. Kuandaa Mabadiliko Yote (Stage Changes)**

Hii inaambia Git ikusanye mabadiliko yote tuliyoyafanya kwenye faili zote.

```bash
git add .
```

**2. Kuhifadhi Mabadiliko (Commit Changes)**

Hii inahifadhi mabadiliko yote yaliyoandaliwa na kuyawekea ujumbe unaoelezea ni nini kimefanyika. Unaweza kubadilisha ujumbe (`"Finalize system improvements..."`) uwe unavyotaka.

```bash
git commit -m "Finalize system improvements and connect to Firestore database"
```

**3. Kupeleka Mabadiliko Kwenye GitHub (Push to GitHub)**

Hii inatuma mabadiliko yote yaliyohifadhiwa kutoka kwenye kompyuta yako kwenda kwenye `repository` yako ya GitHub.

```bash
git push
```

### Baada ya Ku-push

Mara tu utakapomaliza `git push`, Netlify (ambayo imeunganishwa na akaunti yako ya GitHub) itatambua mabadiliko mapya kiotomatiki na kuanza mchakato wa `deployment`. Baada ya dakika chache, mfumo wako mpya wa MaliMax utakuwa hewani na mabadiliko yote.

Asante!
