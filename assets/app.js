const LOGO='https://i.postimg.cc/8zMT8g8M/No-background.png';
const P=[['index.html','Accueil'],['universite.html',"L'Université"],['facultes.html','Facultés & Programmes'],['admissions.html','Admissions'],['actualites.html','Actualités'],['contact.html','Contact']];
/* Ajouter une page = ajouter une ligne dans P (ex: ['facultes.html','Facultés']) */
const FAC=[['agronomie.html','🌱','Sciences agronomiques'],['infirmieres.html','🩺','Sciences infirmières'],['pharmacologie.html','💊','Pharmacologie'],['administration.html','📊','Sciences administratives']];
const cur=document.body.dataset.page;
document.body.insertAdjacentHTML('afterbegin',`<header id="hdr"><a class="logo" href="index.html"><img src="${LOGO}" alt="Logo IFSA University"><span>IFSA University<small>Savoir · Excellence · Impact</small></span></a>
<nav id="nav" aria-label="Navigation principale">${P.map(p=>p[0]=='facultes.html'?`<div class="dd"><a href="facultes.html" class="${cur=='facultes.html'||FAC.some(f=>f[0]==cur)?'on':''}">Facultés ▾</a><div>${FAC.map(f=>`<a href="${f[0]}">${f[1]} ${f[2]}</a>`).join('')}</div></div>`:`<a href="${p[0]}" class="${p[0]==cur?'on':''}">${p[1]}</a>`).join('')}</nav>
<a class="btn btn-gold" href="admissions.html">Admissions</a><button id="burger" aria-label="Menu">☰</button></header>`);
document.body.insertAdjacentHTML('beforeend',`<footer><div class="wrap"><div class="grid4"><div><h3>IFSA University</h3><p>Institut de Formation Supérieure en Sciences Administratives et Appliquées. Une formation de qualité au meilleur coût, depuis 2007.</p></div>
<div><h3>Navigation</h3>${P.map(p=>`<a href="${p[0]}">${p[1]}</a>`).join('')}</div>
<div><h3>Facultés</h3>${FAC.map(f=>`<a href="${f[0]}">${f[2]}</a>`).join('')}</div>
<div><h3>Contact</h3><a href="tel:+50933532415">33 53 24 15</a><a href="tel:+50947664845">47 66 48 45</a><a href="mailto:info@ifsauniversity.edu.ht">info@ifsauniversity.edu.ht</a><a>ifsauniversity.edu.ht</a></div></div>
<p class="copy">© 2026 IFSA University. Tous droits réservés.</p></div></footer>`);
const h=document.getElementById('hdr');
addEventListener('scroll',()=>h.classList.toggle('sm',scrollY>40),{passive:true});
document.getElementById('burger').onclick=()=>document.getElementById('nav').classList.toggle('open');
const io=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.1});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));
document.querySelectorAll('[data-n]').forEach(el=>{const t=+el.dataset.n,s=el.dataset.s||'';let k=0;const i=setInterval(()=>{k+=Math.ceil(t/40);if(k>=t){k=t;clearInterval(i)}el.textContent=k+s},30)});

/* ===== Chatbot local (aucune API) ===== */
const KB=[
[['bonjour','salut','bonsoir','hello','coucou'],'<p>Bonjour ! 👋 Je suis l\'assistant d\'IFSA University. Posez-moi une question sur les programmes, l\'inscription, les frais ou nos sites.</p>'],
[['merci','super','parfait'],'<p>Avec plaisir ! 😊 Autre question ?</p>'],
[['agronom','agricul','agroeco','elevage'],'<p><b>Sciences agronomiques</b> : production végétale, production animale, agroéconomie, gestion des ressources naturelles.</p><p><a href="agronomie.html">Voir la faculté</a></p>'],
[['infirm','sante','soins','maternelle'],'<p><b>Sciences infirmières</b> : soins généraux, santé communautaire, santé maternelle et infantile, gestion des services de santé.</p><p><a href="infirmieres.html">Voir la faculté</a></p>'],
[['pharma','medicament','chimie'],'<p><b>Pharmacologie</b> : chimie pharmaceutique, pharmacologie, pharmacie galénique, contrôle de qualité.</p><p><a href="pharmacologie.html">Voir la faculté</a></p>'],
[['administ','management','marketing','comptab','finance','projet','gestion','rh'],'<p><b>Sciences administratives</b> : management, ressources humaines, marketing, comptabilité et finance, gestion de projets.</p><p><a href="administration.html">Voir la faculté</a></p>'],
[['programme','formation','faculte','filiere','discipline','cursus'],'<p>IFSA propose 4 disciplines :</p><ul><li><a href="agronomie.html">Sciences agronomiques</a></li><li><a href="infirmieres.html">Sciences infirmières</a></li><li><a href="pharmacologie.html">Pharmacologie</a></li><li><a href="administration.html">Sciences administratives</a></li></ul>'],
[['en ligne','formulaire','preinscri'],'<p>Vous pouvez faire votre pré-inscription en ligne : <a href="inscription.html">formulaire d\'inscription</a>.</p>'],
[['admission','inscri','candidat','dossier','piece','document'],'<p>Pièces à fournir : fiches et certificats Bac I et II, 3 photos d\'identité, acte de naissance ou extrait des archives, frais d\'inscription.</p><p><a href="admissions.html">Voir la procédure</a></p>'],
[['frais','prix','cout','tarif','payer','bourse','scolarite'],'<p>Frais d\'inscription : 300 $HT. Examens : 200 $HT par période. Une formule demi-bourse existe. Les montants de scolarité sont à confirmer : <a href="contact.html">contactez-nous</a>.</p>'],
[['campus','site','adresse','carrefour','paix','miragoane','goave','ou '],'<p>IFSA est présente sur 4 sites :</p><ul><li>Carrefour (siège)</li><li>Port-de-Paix</li><li>Miragoâne</li><li>Petit-Goâve</li></ul><p><a href="contact.html">Adresses et contacts</a></p>'],
[['contact','telephone','appel','email','mail','joindre'],'<p>📞 33 53 24 15 / 47 66 48 45<br>✉️ info@ifsauniversity.edu.ht</p><p><a href="contact.html">Page contact</a></p>'],
[['histoire','fonde','2007','creation','qui etes'],'<p>IFSA a ouvert le 27 octobre 2007 pour rendre l\'université accessible aux jeunes, au meilleur coût.</p><p><a href="universite.html">Notre histoire</a></p>'],
[['mission','vision','valeur'],'<p>Mission : former des jeunes professionnels et cadres, au meilleur coût, selon les normes nationales et internationales. Valeurs : excellence, intégrité, innovation, engagement.</p>']];
const norm=t=>t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
document.body.insertAdjacentHTML('beforeend',`<button class="cb-fab" id="cbF" aria-label="Ouvrir l'assistant">💬</button><div class="cb" id="cb" role="dialog" aria-label="Assistant IFSA"><header><span>Assistant IFSA<small>Réponses immédiates</small></span><button id="cbX" aria-label="Fermer">×</button></header><div class="cb-m" id="cbM" aria-live="polite"></div><div class="cb-c" id="cbC"></div><form id="cbQ"><input id="cbI" placeholder="Votre question…" autocomplete="off" aria-label="Votre question"><button>Envoyer</button></form></div>`);
const M=document.getElementById('cbM'),add=(h,c)=>{M.insertAdjacentHTML('beforeend',`<div class="m ${c}">${h}</div>`);M.scrollTop=M.scrollHeight};
const ask=q=>{add(q.replace(/</g,'&lt;'),'u');add('<span class="dots"><span></span><span></span><span></span></span>','b');const n=norm(q);let best=null,bs=0;KB.forEach(e=>{const sc=e[0].filter(k=>n.includes(k)).length;if(sc>bs){bs=sc;best=e}});
setTimeout(()=>{M.lastChild.remove();add(best?best[1]:'<p>Je n\'ai pas cette information pour le moment.</p><p><a href="contact.html">Écrivez-nous</a> ou appelez le 33 53 24 15.</p>','b')},600)};
document.getElementById('cbC').innerHTML=['Programmes','Inscription','Frais','Nos sites','Contact'].map(t=>`<button type="button">${t}</button>`).join('');
document.querySelectorAll('#cbC button').forEach(b=>b.onclick=()=>ask(b.textContent));
const cb=document.getElementById('cb'),tg=o=>{cb.classList.toggle('open',o);if(o&&!M.children.length)add(KB[0][1],'b')};
document.getElementById('cbF').onclick=()=>tg(!cb.classList.contains('open'));document.getElementById('cbX').onclick=()=>tg(false);
document.getElementById('cbQ').onsubmit=e=>{e.preventDefault();const i=document.getElementById('cbI');if(i.value.trim()){ask(i.value.trim());i.value=''}};
addEventListener('keydown',e=>{if(e.key=='Escape')tg(false)});
