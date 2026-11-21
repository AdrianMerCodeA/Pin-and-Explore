$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$source = 'C:\Users\Void\Downloads\Map World.jfif'
$output = Join-Path (Get-Location) 'Map World.svg'
$bmp = [System.Drawing.Bitmap]::new($source)
$w = $bmp.Width; $h = $bmp.Height
$pixels = [int[]]::new($w * $h)
for ($y = 0; $y -lt $h; $y++) { for ($x = 0; $x -lt $w; $x++) { $c=$bmp.GetPixel($x,$y); $pixels[$y*$w+$x]=($c.R -shl 16) -bor ($c.G -shl 8) -bor $c.B } }
$bmp.Dispose()

$code = @'
using System;
using System.Collections.Generic;
using System.Text;
public static class MapTrace {
  static int W,H; static int[] P, C; static int[,] Pal;
  struct E { public int X1,Y1,X2,Y2; public E(int a,int b,int c,int d){X1=a;Y1=b;X2=c;Y2=d;} }
  static int Key(int x,int y){return y*(W+1)+x;}
  static int Dir(E e){ if(e.X2>e.X1)return 0; if(e.Y2>e.Y1)return 1; if(e.X2<e.X1)return 2; return 3; }
  public static string Run(int w,int h,int[] pixels) {
    W=w;H=h;P=pixels;
    Pal=new int[,]{{49,153,164},{197,240,234},{25,180,55},{6,139,224},{218,51,83},{232,222,61},{232,124,23},{138,85,207},{64,78,66}};
    string[] names={"ocean","coast","north-america","europe","asia","africa","south-america","oceania","ink"};
    string[] fills={"#3199a4","#c5f0ea","#19b437","#068be0","#da3353","#e8de3d","#e87c17","#8a55cf","#404e42"};
    C=new int[w*h];
    for(int i=0;i<P.Length;i++){int c=P[i],r=(c>>16)&255,g=(c>>8)&255,b=c&255,best=0,bd=int.MaxValue;for(int k=0;k<Pal.GetLength(0);k++){int dr=r-Pal[k,0],dg=g-Pal[k,1],db=b-Pal[k,2],d=dr*dr+dg*dg+db*db;if(d<bd){bd=d;best=k;}}C[i]=best;}
    StringBuilder s=new StringBuilder();
    s.Append("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 ").Append(w).Append(' ').Append(h).Append("\" width=\"").Append(w).Append("\" height=\"").Append(h).Append("\"><title>Vectorized world map</title><rect width=\"100%\" height=\"100%\" fill=\"").Append(fills[0]).Append("\"/>");
    for(int k=1;k<names.Length;k++){
      List<E> edges=new List<E>();
      for(int y=0;y<h;y++)for(int x=0;x<w;x++)if(C[y*w+x]==k){
        if(y==0||C[(y-1)*w+x]!=k)edges.Add(new E(x,y,x+1,y));
        if(x==w-1||C[y*w+x+1]!=k)edges.Add(new E(x+1,y,x+1,y+1));
        if(y==h-1||C[(y+1)*w+x]!=k)edges.Add(new E(x+1,y+1,x,y+1));
        if(x==0||C[y*w+x-1]!=k)edges.Add(new E(x,y+1,x,y));
      }
      Dictionary<int,List<int>> starts=new Dictionary<int,List<int>>();
      for(int i=0;i<edges.Count;i++){int key=Key(edges[i].X1,edges[i].Y1);if(!starts.ContainsKey(key))starts[key]=new List<int>();starts[key].Add(i);}
      bool[] used=new bool[edges.Count]; StringBuilder d=new StringBuilder();
      for(int ei=0;ei<edges.Count;ei++)if(!used[ei]){
        List<int[]> pts=new List<int[]>(); E first=edges[ei],cur=first; int idx=ei; used[idx]=true;pts.Add(new int[]{cur.X1,cur.Y1});pts.Add(new int[]{cur.X2,cur.Y2});
        int guard=0;
        while((cur.X2!=first.X1||cur.Y2!=first.Y1)&&guard++<edges.Count+2){
          int key=Key(cur.X2,cur.Y2);if(!starts.ContainsKey(key))break; int pick=-1,score=-999;
          foreach(int cand in starts[key])if(!used[cand]){int turn=(Dir(edges[cand])-Dir(cur)+4)%4;int sc=turn==1?4:turn==0?3:turn==3?2:1;if(sc>score){score=sc;pick=cand;}}
          if(pick<0)break;idx=pick;used[idx]=true;cur=edges[idx];pts.Add(new int[]{cur.X2,cur.Y2});
        }
        if(pts.Count<4)continue;
        List<int[]> simple=new List<int[]>();
        for(int j=0;j<pts.Count-1;j++){int[] a=pts[(j+pts.Count-2)%(pts.Count-1)],b=pts[j],c=pts[j+1];if((b[0]-a[0])*(c[1]-b[1])!=(b[1]-a[1])*(c[0]-b[0]))simple.Add(b);}
        if(simple.Count<3)continue;
        d.Append('M').Append(simple[0][0]).Append(' ').Append(simple[0][1]);for(int j=1;j<simple.Count;j++)d.Append('L').Append(simple[j][0]).Append(' ').Append(simple[j][1]);d.Append('Z');
      }
      if(d.Length>0)s.Append("<path id=\"").Append(names[k]).Append("\" fill=\"").Append(fills[k]).Append("\" fill-rule=\"evenodd\" d=\"").Append(d).Append("\"/>");
    }
    s.Append("</svg>");return s.ToString();
  }
}
'@
Add-Type -TypeDefinition $code
$svg = [MapTrace]::Run($w,$h,$pixels)
[System.IO.File]::WriteAllText($output,$svg,[System.Text.UTF8Encoding]::new($false))
Get-Item -LiteralPath $output | Select-Object FullName,Length
