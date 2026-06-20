# Separador local de fotos escaneadas

Aplicativo local/offline em Python para separar automaticamente fotos antigas colocadas juntas no vidro de um scanner flatbed. Ele recebe uma pasta com scans grandes, detecta as fotos sobre um fundo escuro, recorta cada foto e salva os resultados em subpastas organizadas.

O app **não controla o scanner**. Ele só processa imagens já escaneadas.

## Recursos do MVP

- Funciona localmente, sem upload, nuvem ou APIs externas.
- Interface simples com Tkinter, compatível com macOS e Windows.
- Entrada por pasta e saída por pasta.
- Suporte a JPG, JPEG, PNG, TIFF/TIF e BMP.
- Detecção de fotos por OpenCV usando escala de cinza, blur, threshold e contornos.
- Margem extra configurável para evitar cortar partes importantes.
- Filtro por área mínima para ignorar sujeiras/ruídos.
- Opção de fundo preto/escuro ativada por padrão.
- Tentativa opcional de correção de pequena rotação com `minAreaRect`.
- Preview com retângulos verdes e numeração das fotos detectadas.
- Nomes seguros: se um arquivo já existir, o app cria sufixos incrementais.
- Logs claros e processamento resiliente: erro em um scan não interrompe o lote inteiro.

## Instalação

### 1. Instale Python

Instale Python 3.10 ou superior:

- Windows: <https://www.python.org/downloads/windows/>
- macOS: <https://www.python.org/downloads/macos/>

No Windows, marque a opção **Add Python to PATH** durante a instalação.

### 2. Crie e ative um ambiente virtual

No Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

No macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

## Como rodar

```bash
python main.py
```

Em alguns Macs, o comando pode ser:

```bash
python3 main.py
```

Na interface:

1. Escolha a pasta de entrada com os scans.
2. Escolha a pasta de saída.
3. Ajuste parâmetros se necessário.
4. Clique em **Processar scans**.
5. Acompanhe o log e o resumo final.

## Estrutura de entrada e saída

Entrada esperada:

```text
entrada/
  scan_001.jpg
  scan_002.jpg
```

Saída gerada:

```text
saida/
  scan_001/
    scan_001_foto_01.jpg
    scan_001_foto_02.jpg
    scan_001_foto_03.jpg
    scan_001_preview.jpg
  scan_002/
    scan_002_foto_01.jpg
    scan_002_foto_02.jpg
    scan_002_preview.jpg
```

Se um arquivo com o mesmo nome já existir, o app salva outro com sufixo, por exemplo `scan_001_foto_01_02.jpg`.

## Como preparar os scans

Para melhorar a detecção:

- Use uma folha/cartolina preta fosca atrás das fotos.
- Deixe espaço entre as fotos, idealmente pelo menos alguns milímetros.
- Evite que fotos encostem nas bordas do scanner.
- Limpe o vidro para reduzir pontos claros e poeira.
- Escaneie em 300 DPI ou mais para fotos pequenas.
- Evite reflexos, fundos brilhantes e sombras fortes.
- Fotos muito escuras em fundo preto podem exigir threshold menor ou fundo claro em uma versão futura.

## Parâmetros da interface

- **Margem extra (px)**: adiciona borda ao redor do corte. Se estiver cortando conteúdo, aumente este valor.
- **Área mínima detectada**: ignora contornos pequenos. Se estiver detectando sujeira, aumente. Se estiver ignorando fotos pequenas, diminua.
- **Threshold detecção**: separa áreas claras do fundo escuro. Para fundo preto, valores comuns ficam entre 30 e 80.
- **Fundo preto/escuro**: usa threshold manual. Desative para tentar threshold automático com Otsu.
- **Tentar corrigir rotação**: usa o retângulo rotacionado do OpenCV para endireitar pequenas inclinações. Se algum corte ficar estranho, desative.

## Dicas para melhorar a detecção

- Se nenhuma foto for detectada: diminua o threshold ou a área mínima.
- Se detectar partes do fundo como foto: aumente o threshold ou a área mínima.
- Se cortar pedaços da foto: aumente a margem extra.
- Se uma foto inclinada sair cortada: aumente a margem ou desative a correção de rotação.
- Se duas fotos grudarem em um único corte: deixe mais espaço entre elas no scanner.

## Arquivos principais

- `main.py`: ponto de entrada; abre a interface.
- `app.py`: interface Tkinter e processamento em thread para não travar a janela.
- `scanner_splitter.py`: detecção, previews, recortes e processamento de pastas.
- `image_utils.py`: leitura/salvamento de imagens, extensões aceitas e nomes únicos.
- `requirements.txt`: dependências Python.

## Observações

Este é um MVP funcional. A lógica favorece segurança no recorte: é melhor deixar uma pequena borda sobrando do que cortar conteúdo da foto. Em scans difíceis, ajuste os parâmetros e confira os arquivos `*_preview.jpg`.
