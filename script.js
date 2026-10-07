const DATA={"perfector": {"label": "Lip Perfector", "shades": {"Rosewood": {"c": "#B04D5A", "note": "Dusty and grown-up. The everyday one."}, "Berry": {"c": "#A31350", "note": "Deep berry with a glassy finish."}, "Peony": {"c": "#D78F9B", "note": "Soft pink that reads fresh in daylight."}, "Clay": {"c": "#C97374", "note": "A warm, rosy nude that brightens bare lips."}, "Coral": {"c": "#F08F9A", "note": "Bright pink-coral, easy to layer."}}}, "oil": {"label": "Lip Oil", "shades": {"Raspberry": {"c": "#E72965", "note": "Bright pink with a fresh, juicy look."}, "Honey": {"c": "#FF9000", "note": "Warm amber that adds a golden glow."}, "Mahogany": {"c": "#531309", "note": "Deep brown-red for a dark, rich lip."}, "Cherry": {"c": "#9F031B", "note": "A clear, true red. Glossy and bold."}}}}
const imgOf=(p,n)=>`images/${p==='oil'?'oil':'perfector'}-${n.toLowerCase()}.jpg`;
function show(v,name,product){
  const p=product||v.dataset.product,s=DATA[p].shades[name];v.dataset.product=p;
  v.style.setProperty('--shade',s.c);document.documentElement.style.setProperty('--shade',s.c);
  const img=v.querySelector('.v-img');img.src=imgOf(p,name);img.alt=DATA[p].label+' in '+name;
  img.classList.remove('swap');void img.offsetWidth;img.classList.add('swap');img.classList.remove('idle');
  v.querySelector('.v-name').textContent=name;v.querySelector('.v-note').textContent=s.note;
  v.querySelectorAll('.dot').forEach(d=>d.setAttribute('aria-pressed',d.dataset.name===name));
}
document.querySelectorAll('.viewer').forEach(v=>{
  const box=v.querySelector('.dots');if(!box)return;const p=v.dataset.product;
  Object.entries(DATA[p].shades).forEach(([n,s])=>{
    const b=document.createElement('button');b.className='dot';b.dataset.name=n;b.style.background=s.c;
    b.setAttribute('aria-label',n);b.setAttribute('aria-pressed','false');b.onclick=()=>show(v,n);box.appendChild(b);
  });
  show(v,Object.keys(DATA[p].shades)[0]);
});
const quiz=document.getElementById('quiz');
if(quiz){
  const res=document.getElementById('result');
  const sync=()=>{const p=quiz.product.value;quiz.querySelector('.f-perf').hidden=p!=='perfector';quiz.querySelector('.f-oil').hidden=p!=='oil'};
  quiz.addEventListener('change',sync);sync();
  const MAP={light:{glow:'Peony',tint:'Coral',shimmer:'Rosewood'},medium:{glow:'Clay',tint:'Rosewood',shimmer:'Coral'},deep:{glow:'Rosewood',tint:'Berry',shimmer:'Berry'}};
  const OIL={soft:'Raspberry',warm:'Honey',bold:'Cherry',deep:'Mahogany'};
  quiz.addEventListener('submit',e=>{
    e.preventDefault();const p=quiz.product.value;
    const name=p==='perfector'?MAP[quiz.tone.value][quiz.finish.value]:OIL[quiz.mood.value];
    show(res,name,p);res.querySelector('.v-name').textContent=DATA[p].label+' in '+name;
  });
}
