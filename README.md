# 🌿 Green Place

**Uma landing page educativa para explorar a ciência dos telhados verdes.**

O Green Place conecta sustentabilidade, arquitetura e tecnologia em uma experiência visual: o visitante explora as camadas de uma cobertura vegetal, compara situações de sol e chuva e experimenta um simulador de retenção de água e temperatura superficial.

O projeto usa **HTML5, CSS3 e JavaScript puro**, sem etapa de build, dependências de execução, back-end, banco de dados ou autenticação.

## O que você encontra

- Infográfico interativo de seis camadas, com navegação por mouse e teclado.
- Comparação visual entre coberturas convencionais e verdes em dias de sol ou chuva.
- Cards de benefícios, dados contextualizados e links de pesquisas.
- Simulador com área, chuva, espessura do substrato e umidade inicial.
- Comparação térmica hipotética e download de um relatório do cenário.
- Exemplos reais de Chicago e da California Academy of Sciences.
- Conexões com Biologia, Física, Matemática, Geografia, Arquitetura e Tecnologia.
- Calendário de manutenção com armazenamento no navegador e exportação `.ics`.
- Planejador de manutenção na seção do simulador: a partir de data, local, quantidade de placas, perímetro e incidência solar, gera um cronograma anual em calendário, com passo a passo e exportação `.ics`.
- Layout responsivo e suporte à preferência de movimento reduzido.

## Como executar

Baixe ou clone o repositório e abra `index.html` no navegador. Não é necessário executar `npm install`.

Para desenvolver e depurar, prefira um servidor local. Dentro da pasta do projeto, execute:

```sh
python -m http.server 4173 --bind 127.0.0.1
```

No Windows, se o comando `python` não estiver disponível e o Python estiver instalado, tente:

```powershell
py -m http.server 4173 --bind 127.0.0.1
```

Abra **http://127.0.0.1:4173**. Para encerrar o servidor, pressione `Ctrl + C` no terminal.

Outra opção é abrir a pasta no VS Code e usar a extensão Live Server. Use um servidor por vez; se a porta 4173 estiver ocupada, escolha outra, como 4174, e altere o endereço no navegador.

## Estrutura dos arquivos

```text
.
├── index.html             # Conteúdo, estrutura e referências
├── styles.css             # Estilos da base original
├── experience.css         # Visual atual, componentes e responsividade
├── app.js                 # Camadas, clima e calendário de manutenção
├── simulator.js           # Modelo matemático independente da interface
├── experience.js          # Interface do simulador, gráficos e animações
├── maintenance.js         # Planejador de manutenção (cronograma em calendário)
├── maintenance.css        # Estilos do planejador de manutenção
├── check-simulator.cjs    # Verificação automatizada dos cálculos
└── assets/                # Imagens, logo SVG e favicon
```

Para mudar textos, edite `index.html`. Para ajustar o visual atual, comece por `experience.css`, carregado depois de `styles.css`. Para alterar cálculos, edite `simulator.js`; a apresentação dos resultados fica em `experience.js`.

## Como depurar

1. Execute o servidor local e abra o site no Chrome, Edge ou Firefox.
2. Pressione `F12` ou `Ctrl + Shift + I` para abrir as ferramentas de desenvolvimento.
3. Em **Console**, confira os erros e avisos. Em **Network/Rede**, recarregue a página e confira se HTML, CSS, JavaScript e imagens carregam sem erro 404.
4. Em **Sources/Fontes** (ou **Debugger** no Firefox), abra `simulator.js`, `experience.js` ou `app.js` e clique no número de uma linha para adicionar um breakpoint. Depois interaja com o site para interromper a execução e inspecionar as variáveis.
5. Para investigar os cálculos, coloque o breakpoint em `calculateScenario`, dentro de `simulator.js`. A função recebe os parâmetros do cenário e retorna os volumes de água e as temperaturas hipotéticas.
6. Para verificar eventos e a atualização do HTML, coloque um breakpoint em `update`, dentro de `experience.js`. Para clima e camadas, procure `setScenario` e `selectLayer` em `app.js`.
7. Use o modo de dispositivos das ferramentas de desenvolvimento para conferir o layout em larguras diferentes, incluindo 320 px, 390 px, 768 px e desktop.

Também é possível chamar o cálculo diretamente pelo Console:

```js
GreenPlaceSimulator.calculateScenario({
  area: 100,
  rainfall: 30,
  depth: 10,
  moisture: 'moist',
  temperature: 55,
  difference: 17,
});
```

Nesse exemplo, os resultados esperados são **3.000 L recebidos, 1.250 L retidos e 1.750 L escoados**. A comparação térmica independente resulta em **55 °C e 38 °C**.

### Verificar o modelo pelo terminal

Com Node.js instalado, execute:

```sh
node check-simulator.cjs
```

O script verifica o cenário de referência, entradas inválidas, chuva zero, saturação, proporcionalidade da área e conservação do volume de água em 144 combinações de entradas. Node.js é necessário apenas para essa verificação, não para abrir o site.

### Problemas comuns

| Sintoma | O que conferir |
| --- | --- |
| As mudanças de CSS não aparecem | Recarregue com `Ctrl + F5`; nas ferramentas de desenvolvimento, desative o cache enquanto o painel estiver aberto. |
| O terminal informa que a porta está em uso | Encerre o servidor anterior ou escolha outra porta. |
| Imagens ou scripts retornam 404 | Inicie o servidor na pasta que contém `index.html` e mantenha a pasta `assets/` junto dos arquivos. |
| O simulador mostra um traço em vez de números | Informe uma área entre 1 e 10.000 m². Confira o Console se a entrada for válida. |
| A agenda parece ter desaparecido | Os dados pertencem ao navegador e à origem usados. `file://`, `localhost` e `127.0.0.1`, assim como portas diferentes, podem ter armazenamentos distintos. |
| Animações não são exibidas | Confira se o sistema operacional está configurado para reduzir movimento; o site respeita essa preferência. |

Para inspecionar a agenda no Chrome/Edge, abra **Application/Aplicativo → Local Storage** e procure `green-place-modules-v1`. Remover essa chave apaga os módulos salvos nessa origem; exporte a agenda antes se quiser preservá-la.

## Modelo educativo e fontes

O cálculo de água utiliza:

```text
Volume recebido (L) = área (m²) × chuva (mm)
Capacidade disponível (mm) = substrato (cm) × 10 × 0,25 × fração disponível
Volume retido (L) = área × mínimo(chuva, capacidade disponível)
Escoamento (L) = volume recebido − volume retido
```

As frações de disponibilidade são cenários didáticos: seco = 1; úmido = 0,5; saturado = 0. O coeficiente 0,25 é uma aproximação inspirada na orientação da Penn State Extension. O modelo não calcula intensidade e duração da chuva, vazão de pico ou evapotranspiração durante o evento.

A comparação térmica é independente do evento de chuva: a diferença escolhida é subtraída da temperatura superficial convencional. Não é uma previsão de temperatura interna nem de economia de energia.

**As simulações são estimativas educativas, não garantias de desempenho ou dimensionamento de uma instalação.** As premissas também podem ser consultadas em **“Ver fórmulas”** no próprio site.

Fontes utilizadas:

- [Penn State — Stormwater Quantity](https://plantscience.psu.edu/research/centers/green-roof/research/stormwater/stormwater-quantity)
- [Penn State Extension — Green Roofs: Benefits and Design Considerations](https://extension.psu.edu/green-roofs-benefits-and-design-considerations)
- [US EPA — Lower Building Energy Demands](https://www.epa.gov/green-infrastructure/lower-building-energy-demands)
- [Philadelphia Water Department — Green Roofs](https://water.phila.gov/development/stormwater-plan-review/manual/chapter-4/4-3-green-roofs/)
- [National Park Service — Chicago City Hall](https://www.nps.gov/articles/000/green-roofs-on-historic-buildings-chicago-city-hall.htm)
- [California Academy of Sciences — Living Roof](https://www.calacademy.org/exhibits/living-roof)

As imagens do site são conceituais; as representações dos casos reais são esquemáticas. A logo adapta a referência fornecida para a identidade **Green Place**.

## Dados e validação

A agenda é salva somente no navegador. Não há envio de módulos a um serviço remoto.

O modelo matemático foi validado pelo script incluído. As principais interações foram verificadas no Microsoft Edge, incluindo navegação por teclado, troca de clima, atualização do simulador, downloads e manutenção da agenda. O layout foi conferido em larguras entre 320 e 1.440 px; isso não representa uma auditoria completa de acessibilidade nem testes em todos os navegadores ou aparelhos físicos.
