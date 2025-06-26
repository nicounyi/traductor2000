import { useState } from 'react'
import { 
  Container, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Box, 
  Alert, 
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton,
} from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import { AVAILABLE_MODELS } from './services/translationProviders'
import { extractTranslations } from './services/translationService'

const defaultModel = AVAILABLE_MODELS.find(m => m.id === 'gemini-2.0-flash') || AVAILABLE_MODELS[0];

function App() {
  const [html, setHtml] = useState('')
  const [prefix, setPrefix] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState(defaultModel.id)

  const selectedProvider = AVAILABLE_MODELS.find(m => m.id === selectedModel)?.provider || 'google'
  const apiKey = selectedProvider === 'openai' ? import.meta.env.VITE_OPENAI_API_KEY : import.meta.env.VITE_GEMINI_API_KEY

  const handleTranslate = async () => {
    if (!apiKey) {
      setError(`${selectedProvider === 'openai' ? 'OpenAI' : 'Google AI'} API Key not found in environment variables`)
      return
    }

    if (!html.trim()) {
      setError('HTML input is required')
      return
    }

    try {
      setError(null)
      setIsLoading(true)
      setOutput('')
      
      const translations = await extractTranslations(html, prefix, apiKey, selectedModel)
      
      if (Object.keys(translations).length === 0) {
        setError('No translations were generated. Please check your HTML input.')
        return
      }

      const formattedOutput = JSON.stringify(translations, null, 2)
      setOutput(formattedOutput)
    } catch (error) {
      console.error('Error processing HTML:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error processing HTML. Please check your input and API key.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        HTML Translation Key Generator
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <FormControl fullWidth>
            <InputLabel id="model-select-label">AI Model</InputLabel>
            <Select
              labelId="model-select-label"
              value={selectedModel}
              label="AI Model"
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {AVAILABLE_MODELS.map((model) => (
                <MenuItem key={model.id} value={model.id}>
                  {model.name} ({model.provider === 'openai' ? 'OpenAI' : 'Google AI'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip 
            title={
              <Box>
                {AVAILABLE_MODELS.map((model) => (
                  <Box key={model.id} sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">{model.name}</Typography>
                    <Typography variant="body2">{model.description}</Typography>
                  </Box>
                ))}
              </Box>
            }
          >
            <IconButton>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <TextField
          label="Translation Key Prefix"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder="e.g., DEBFRONT.HTML.STYLEGUIDE.TEMPLATES.DASH.REVIEW"
          fullWidth
        />
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            error.includes('quota exceeded') || error.includes('billing') ? (
              <Button 
                color="inherit" 
                size="small"
                href={selectedProvider === 'openai' 
                  ? "https://platform.openai.com/account/billing"
                  : "https://console.cloud.google.com/billing"
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                Check Billing
              </Button>
            ) : error.includes('rate limit') ? (
              <Typography variant="caption" sx={{ display: 'inline-block', ml: 2 }}>
                Try again in a minute or switch provider
              </Typography>
            ) : null
          }
        >
          {error.split('\n').map((line, i) => (
            <Typography key={i} component="div">
              {line}
            </Typography>
          ))}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 4 }}>
        <TextField
          label="Input HTML"
          multiline
          rows={10}
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          error={!html.trim()}
          helperText={!html.trim() ? "HTML input is required" : ""}
        />
        
        <Button 
          variant="contained" 
          onClick={handleTranslate}
          disabled={!html.trim() || !apiKey || isLoading}
          sx={{ mb: 2 }}
        >
          {isLoading ? 'Processing...' : 'Generate Translations'}
        </Button>

        {output && (
          <TextField
            label="Generated Translations"
            multiline
            rows={10}
            value={output}
            fullWidth
            InputProps={{
              readOnly: true,
            }}
          />
        )}
      </Paper>
    </Container>
  )
}

export default App
