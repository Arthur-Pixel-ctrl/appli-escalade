def lum(h):
    h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    c=[x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4 for x in c]
    return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]
def r(a,b):
    la,lb=sorted([lum(a),lum(b)],reverse=True); return (la+0.05)/(lb+0.05)
paires=[('texte-3 sur fond','#5D5A52','#F1EFE9'),('texte-3 sur surface-creuse (bouton desactive)','#5D5A52','#E6E3DA'),
('texte-2 sur avertissement-fond','#4B4943','#FBEFD5'),('texte-2 sur arret-fond','#4B4943','#F8E1DC'),
('arret sur arret-fond (bouton arret)','#A32E1E','#F8E1DC'),('arret sur fond (message-erreur)','#A32E1E','#F1EFE9'),
('sur-accent sur accent','#FFFFFF','#0F5A54'),('accent sur fond (focus, 3:1)','#0F5A54','#F1EFE9'),
('focus-sur-sombre sur preparation','#7FC4BA','#1D1C19'),('focus-sur-sombre sur repos','#7FC4BA','#0F5A54'),
('accent sur effort (focus)','#0F5A54','#F6F4EE'),('filet-fort sur surface (bords champs 3:1)','#8C8980','#FBFAF7'),
('filet-fort sur fond (pointilles desactive)','#8C8980','#F1EFE9'),('fond sur texte (etiquette)','#F1EFE9','#1D1C19'),
('icone avertissement sur avertissement-fond','#8A5200','#FBEFD5'),('repos texte','#FBFAF7','#0F5A54'),
('focus accent sur bouton principal (anneau autour d un bouton resine, decale sur fond)','#0F5A54','#F1EFE9'),
('texte-3 sur surface','#5D5A52','#FBFAF7'),('rubalise ambre vs texte','#E9A23B','#1D1C19')]
for n,a,b in paires: print(f"{r(a,b):5.2f}  {n}")
